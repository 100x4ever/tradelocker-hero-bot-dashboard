import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { db } from './db.js';
import { botEngine } from './botEngine.js';
import { tradeLockerService } from './tradeLockerService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.jsx': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;
  const query = Object.fromEntries(reqUrl.searchParams.entries());

  // Health Check
  if (pathname === '/health') {
    return sendJSON(res, { status: 'ok', timestamp: new Date().toISOString() });
  }

  // GET /api/stats (Syncs with real TradeLocker account state)
  if (pathname === '/api/stats' && req.method === 'GET') {
    await db.syncLiveAccounts();

    const accounts = db.getAccounts();
    const assets = db.getAssets();
    const scenarios = db.getScenarios();

    const totalBalance = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
    const totalEquity = accounts.reduce((acc, a) => acc + (a.equity || 0), 0);
    const dailyPnL = accounts.reduce((acc, a) => acc + (a.dailyPnL || 0), 0);
    const weeklyPnL = accounts.reduce((acc, a) => acc + (a.weeklyPnL || 0), 0);
    const totalPnL = accounts.reduce((acc, a) => acc + (a.totalPnL || 0), 0);

    const closedScenarios = scenarios.filter(s => ['CLOSED_WIN', 'CLOSED_LOSS'].includes(s.status));
    const wins = closedScenarios.filter(s => s.status === 'CLOSED_WIN').length;
    const overallWinRate = closedScenarios.length > 0 
      ? Number(((wins / closedScenarios.length) * 100).toFixed(1)) 
      : (accounts[0]?.winRate || 0);

    return sendJSON(res, {
      totalBalance: Number(totalBalance.toFixed(2)),
      totalEquity: Number(totalEquity.toFixed(2)),
      dailyPnL: Number(dailyPnL.toFixed(2)),
      weeklyPnL: Number(weeklyPnL.toFixed(2)),
      totalPnL: Number(totalPnL.toFixed(2)),
      overallWinRate,
      totalScenariosLogged: scenarios.length,
      activeAssetsCount: assets.filter(a => a.enabled).length,
      accountsCount: accounts.length,
      botState: db.getBotState()
    });
  }

  // GET /api/accounts
  if (pathname === '/api/accounts' && req.method === 'GET') {
    await db.syncLiveAccounts();
    return sendJSON(res, db.getAccounts());
  }

  // GET /api/assets
  if (pathname === '/api/assets' && req.method === 'GET') {
    return sendJSON(res, db.getAssets());
  }

  // POST /api/assets
  if (pathname === '/api/assets' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.symbol) return sendJSON(res, { error: 'Symbol is required' }, 400);

    const id = body.symbol.toLowerCase().replace(/[^a-z0-9]/g, '');
    const existing = db.getAssets().find(a => a.id === id);
    if (existing) return sendJSON(res, { error: 'Asset already exists' }, 400);

    const newAsset = {
      id,
      symbol: body.symbol.toUpperCase(),
      name: body.name || body.symbol.toUpperCase(),
      timeframe: body.timeframe || '15m',
      lotSize: Number(body.lotSize) || 0.1,
      enabled: true,
      totalPnL: 0,
      winCount: 0,
      lossCount: 0,
      winRate: 0,
      strategy: body.strategy || 'EMA & RSI Momentum',
      rsiPeriod: body.rsiPeriod || 14,
      emaFast: body.emaFast || 9,
      emaSlow: body.emaSlow || 21,
      tpPips: body.tpPips || 25,
      slPips: body.slPips || 15,
      lastScanPrice: 0,
      lastScanTime: new Date().toISOString()
    };

    db.data.assets.push(newAsset);
    db.save();
    db.addLog('INFO', `Added asset pair: ${newAsset.symbol}`);
    return sendJSON(res, newAsset, 201);
  }

  // PUT /api/assets/:id
  if (pathname.startsWith('/api/assets/') && req.method === 'PUT') {
    const id = pathname.replace('/api/assets/', '');
    const body = await parseBody(req);
    const updated = db.updateAsset(id, body);
    if (!updated) return sendJSON(res, { error: 'Asset not found' }, 404);
    return sendJSON(res, updated);
  }

  // GET /api/scenarios
  if (pathname === '/api/scenarios' && req.method === 'GET') {
    let scenarios = db.getScenarios();
    const { symbol, timeframe, status, session } = query;

    if (symbol && symbol !== 'ALL') scenarios = scenarios.filter(s => s.symbol === symbol);
    if (timeframe && timeframe !== 'ALL') scenarios = scenarios.filter(s => s.timeframe === timeframe);
    if (status && status !== 'ALL') scenarios = scenarios.filter(s => s.status === status);
    if (session && session !== 'ALL') scenarios = scenarios.filter(s => s.session === session);

    return sendJSON(res, scenarios);
  }

  // GET /api/scenarios/analytics
  if (pathname === '/api/scenarios/analytics' && req.method === 'GET') {
    const scenarios = db.getScenarios();
    const closedScenarios = scenarios.filter(s => ['CLOSED_WIN', 'CLOSED_LOSS'].includes(s.status));

    const calcGroupStats = (groupFn) => {
      const groups = {};
      for (const scen of closedScenarios) {
        const key = groupFn(scen);
        if (!groups[key]) groups[key] = { key, total: 0, wins: 0, losses: 0, totalPnL: 0, winRate: 0 };
        groups[key].total += 1;
        if (scen.status === 'CLOSED_WIN') groups[key].wins += 1;
        if (scen.status === 'CLOSED_LOSS') groups[key].losses += 1;
        groups[key].totalPnL += (scen.pnl || 0);
      }
      return Object.values(groups).map(g => ({
        ...g,
        totalPnL: Number(g.totalPnL.toFixed(2)),
        winRate: g.total > 0 ? Number(((g.wins / g.total) * 100).toFixed(1)) : 0
      })).sort((a, b) => b.winRate - a.winRate);
    };

    return sendJSON(res, {
      totalScenarios: scenarios.length,
      closedTradesCount: closedScenarios.length,
      byTimeframe: calcGroupStats(s => s.timeframe || '15m'),
      bySymbol: calcGroupStats(s => s.symbol || 'OTHER'),
      bySession: calcGroupStats(s => s.session || 'London'),
      bySignalType: calcGroupStats(s => s.signalType || 'BUY')
    });
  }

  // PUT /api/scenarios/:id/status
  if (pathname.includes('/api/scenarios/') && pathname.endsWith('/status') && req.method === 'PUT') {
    const parts = pathname.split('/');
    const id = parts[3];
    const body = await parseBody(req);
    const updated = db.updateScenarioStatus(id, body.status, body);
    if (!updated) return sendJSON(res, { error: 'Scenario not found' }, 404);
    return sendJSON(res, updated);
  }

  // GET /api/scenarios/export (CSV)
  if (pathname === '/api/scenarios/export' && req.method === 'GET') {
    const scenarios = db.getScenarios();
    const headers = ['ID', 'Timestamp', 'Symbol', 'Timeframe', 'Signal', 'Status', 'Entry Price', 'Exit Price', 'SL', 'TP', 'Lot Size', 'PnL ($)', 'Session', 'RSI', 'Notes'];
    const csvRows = [headers.join(',')];
    for (const s of scenarios) {
      csvRows.push([
        s.id,
        `"${s.timestamp}"`,
        s.symbol,
        s.timeframe,
        s.signalType,
        s.status,
        s.price,
        s.exitPrice || '',
        s.sl,
        s.tp,
        s.lotSize,
        s.pnl || 0,
        s.session || '',
        s.rsi || '',
        `"${(s.notes || '').replace(/"/g, '""')}"`
      ].join(','));
    }
    res.writeHead(200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="trade_scenarios_export.csv"'
    });
    return res.end(csvRows.join('\n'));
  }

  // GET /api/logs
  if (pathname === '/api/logs' && req.method === 'GET') {
    return sendJSON(res, db.getLogs());
  }

  // POST /api/bot/toggle
  if (pathname === '/api/bot/toggle' && req.method === 'POST') {
    const currentState = db.getBotState();
    const newState = !currentState.isRunning;
    db.updateBotState({ isRunning: newState });
    if (newState) botEngine.start();
    else botEngine.stop();
    return sendJSON(res, { isRunning: newState, mode: currentState.mode });
  }

  // POST /api/bot/mode
  if (pathname === '/api/bot/mode' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!['Simulation', 'Live'].includes(body.mode)) {
      return sendJSON(res, { error: 'Invalid mode' }, 400);
    }
    const updated = db.updateBotState({ mode: body.mode });
    db.addLog('WARN', `Bot execution mode set to ${body.mode}`);
    return sendJSON(res, updated);
  }

  // GET /api/tradelocker/status
  if (pathname === '/api/tradelocker/status' && req.method === 'GET') {
    return sendJSON(res, {
      isConnected: tradeLockerService.isConnected,
      baseUrl: tradeLockerService.baseUrl,
      email: tradeLockerService.email ? `${tradeLockerService.email.substring(0, 3)}***` : 'Not Set',
      accId: tradeLockerService.accId || 'Not Connected'
    });
  }

  // POST /api/tradelocker/auth
  if (pathname === '/api/tradelocker/auth' && req.method === 'POST') {
    const body = await parseBody(req);
    tradeLockerService.setCredentials(body.email, body.password, body.serverUrl);
    const result = await tradeLockerService.authenticate();
    if (result.success) {
      await db.syncLiveAccounts();
      db.addLog('INFO', 'Successfully authenticated with TradeLocker HeroFX API');
      return sendJSON(res, { success: true, message: 'Connected to TradeLocker API successfully! Live account synced.' });
    }
    return sendJSON(res, { success: false, error: result.reason || 'Auth failed' }, 401);
  }

  // --- STATIC FILE SERVING FOR FRONTEND UI ---
  let filePath = path.join(__dirname, '../dist', pathname === '/' ? 'index.html' : pathname);
  
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '../index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      return res.end(content);
    } catch (err) {
      res.writeHead(500);
      return res.end('Server Error');
    }
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 TradeLocker Bot & Dashboard Server running on port ${PORT}`);
  console.log(`🌐 Local UI: http://localhost:${PORT}`);
  console.log(`=======================================================`);

  // Auto-connect if environment variables are provided
  if (process.env.TRADELOCKER_EMAIL && process.env.TRADELOCKER_PASSWORD) {
    console.log('[TradeLocker API] Authenticating with provided environment credentials...');
    await tradeLockerService.authenticate();
    await db.syncLiveAccounts();
  }

  // Start background trading scanner bot
  botEngine.start();
});
