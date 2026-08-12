import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET Trade Scenarios (with filtering)
router.get('/', (req, res) => {
  const { symbol, timeframe, status, session } = req.query;
  let scenarios = db.getScenarios();

  if (symbol && symbol !== 'ALL') {
    scenarios = scenarios.filter(s => s.symbol === symbol);
  }
  if (timeframe && timeframe !== 'ALL') {
    scenarios = scenarios.filter(s => s.timeframe === timeframe);
  }
  if (status && status !== 'ALL') {
    scenarios = scenarios.filter(s => s.status === status);
  }
  if (session && session !== 'ALL') {
    scenarios = scenarios.filter(s => s.session === session);
  }

  res.json(scenarios);
});

// GET Scenario Success Analytics Breakdown
router.get('/analytics', (req, res) => {
  const scenarios = db.getScenarios();
  const closedScenarios = scenarios.filter(s => ['CLOSED_WIN', 'CLOSED_LOSS'].includes(s.status));

  // Helper to calculate win rate & stats
  const calcGroupStats = (groupFn) => {
    const groups = {};
    for (const scen of closedScenarios) {
      const key = groupFn(scen);
      if (!groups[key]) {
        groups[key] = { key, total: 0, wins: 0, losses: 0, totalPnL: 0, winRate: 0 };
      }
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

  const byTimeframe = calcGroupStats(s => s.timeframe || '15m');
  const bySymbol = calcGroupStats(s => s.symbol || 'OTHER');
  const bySession = calcGroupStats(s => s.session || 'Unknown');
  const bySignalType = calcGroupStats(s => s.signalType || 'BUY');

  // Status breakdown totals
  const statusCounts = scenarios.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalScenarios: scenarios.length,
    closedTradesCount: closedScenarios.length,
    statusCounts,
    byTimeframe,
    bySymbol,
    bySession,
    bySignalType
  });
});

// PUT Update Scenario Status
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, pnl, exitPrice, notes } = req.body;

  const updated = db.updateScenarioStatus(id, status, { pnl, exitPrice, notes });
  if (!updated) {
    return res.status(404).json({ error: 'Scenario not found' });
  }

  res.json(updated);
});

// GET Export CSV
router.get('/export', (req, res) => {
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

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="trade_scenarios_export.csv"');
  res.send(csvRows.join('\n'));
});

export default router;
