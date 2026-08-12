import express from 'express';
import { db } from '../db.js';
import { botEngine } from '../botEngine.js';

const router = express.Router();

// GET Global Dashboard Stats
router.get('/stats', (req, res) => {
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
  const overallWinRate = closedScenarios.length > 0 ? Number(((wins / closedScenarios.length) * 100).toFixed(1)) : 70.0;

  res.json({
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
});

// GET Accounts
router.get('/accounts', (req, res) => {
  res.json(db.getAccounts());
});

// GET Assets
router.get('/assets', (req, res) => {
  res.json(db.getAssets());
});

// PUT Update Asset Scan & Lot Config
router.put('/assets/:id', (req, res) => {
  const { id } = req.params;
  const updatedAsset = db.updateAsset(id, req.body);
  if (!updatedAsset) {
    return res.status(404).json({ error: 'Asset not found' });
  }
  db.addLog('INFO', `Updated scanner settings for ${updatedAsset.symbol}`, `Timeframe: ${updatedAsset.timeframe}, Lot: ${updatedAsset.lotSize}, Active: ${updatedAsset.enabled}`);
  res.json(updatedAsset);
});

// POST Add New Asset
router.post('/assets', (req, res) => {
  const { symbol, name, timeframe, lotSize } = req.body;
  if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

  const id = symbol.toLowerCase().replace(/[^a-z0-0]/g, '');
  const existing = db.getAssets().find(a => a.id === id);
  if (existing) {
    return res.status(400).json({ error: 'Asset symbol already exists' });
  }

  const newAsset = {
    id,
    symbol: symbol.toUpperCase(),
    name: name || symbol.toUpperCase(),
    timeframe: timeframe || '15m',
    lotSize: Number(lotSize) || 0.1,
    enabled: true,
    totalPnL: 0,
    winCount: 0,
    lossCount: 0,
    winRate: 0,
    strategy: 'EMA & RSI Momentum',
    rsiPeriod: 14,
    emaFast: 9,
    emaSlow: 21,
    tpPips: 25,
    slPips: 15,
    lastScanPrice: 0,
    lastScanTime: new Date().toISOString()
  };

  db.data.assets.push(newAsset);
  db.save();
  db.addLog('INFO', `Added new trading asset: ${newAsset.symbol}`);
  res.status(201).json(newAsset);
});

// GET Bot Scanning Logs
router.get('/logs', (req, res) => {
  res.json(db.getLogs());
});

// POST Toggle Master Bot
router.post('/bot/toggle', (req, res) => {
  const currentState = db.getBotState();
  const newState = !currentState.isRunning;
  db.updateBotState({ isRunning: newState });
  
  if (newState) {
    botEngine.start();
  } else {
    botEngine.stop();
  }

  res.json({ isRunning: newState, mode: currentState.mode });
});

// POST Toggle Bot Mode (Simulation / Live)
router.post('/bot/mode', (req, res) => {
  const { mode } = req.body;
  if (!['Simulation', 'Live'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode' });
  }

  const updatedState = db.updateBotState({ mode });
  db.addLog('WARN', `Bot execution mode changed to: ${mode}`);
  res.json(updatedState);
});

export default router;
