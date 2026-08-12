import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'data_store.json');

// Default initial database state
const defaultData = {
  accounts: [
    {
      id: 'herofx-demo-101',
      name: 'HeroFX TradeLocker Demo',
      broker: 'HeroFX (TradeLocker)',
      accNumber: '8849201',
      type: 'Demo',
      server: 'https://demo.tradelocker.com/api/v2',
      balance: 10450.80,
      equity: 10620.40,
      dailyPnL: 310.50,
      weeklyPnL: 840.20,
      totalPnL: 1620.40,
      winRate: 68.4,
      totalTrades: 38,
      status: 'Connected'
    },
    {
      id: 'herofx-live-002',
      name: 'HeroFX Live Account',
      broker: 'HeroFX (TradeLocker)',
      accNumber: '9920154',
      type: 'Live',
      server: 'https://live.tradelocker.com/api/v2',
      balance: 25800.00,
      equity: 26145.25,
      dailyPnL: 145.25,
      weeklyPnL: 1250.00,
      totalPnL: 3450.00,
      winRate: 72.5,
      totalTrades: 52,
      status: 'Simulation Mode'
    }
  ],
  assets: [
    {
      id: 'eurusd',
      symbol: 'EURUSD',
      name: 'Euro / US Dollar',
      timeframe: '15m',
      lotSize: 0.50,
      enabled: true,
      totalPnL: 640.50,
      winCount: 14,
      lossCount: 4,
      winRate: 77.8,
      strategy: 'EMA & RSI Momentum',
      rsiPeriod: 14,
      emaFast: 9,
      emaSlow: 21,
      tpPips: 25,
      slPips: 15,
      lastScanPrice: 1.09245,
      lastScanTime: new Date().toISOString()
    },
    {
      id: 'gbpusd',
      symbol: 'GBPUSD',
      name: 'British Pound / US Dollar',
      timeframe: '1h',
      lotSize: 0.25,
      enabled: true,
      totalPnL: 420.20,
      winCount: 9,
      lossCount: 3,
      winRate: 75.0,
      strategy: 'Breakout & Trend',
      rsiPeriod: 14,
      emaFast: 12,
      emaSlow: 26,
      tpPips: 35,
      slPips: 20,
      lastScanPrice: 1.27180,
      lastScanTime: new Date().toISOString()
    },
    {
      id: 'xauusd',
      symbol: 'XAUUSD',
      name: 'Gold / US Dollar',
      timeframe: '5m',
      lotSize: 0.10,
      enabled: true,
      totalPnL: 890.00,
      winCount: 18,
      lossCount: 8,
      winRate: 69.2,
      strategy: 'Scalp RSI Oversold',
      rsiPeriod: 7,
      emaFast: 5,
      emaSlow: 15,
      tpPips: 40,
      slPips: 25,
      lastScanPrice: 2384.50,
      lastScanTime: new Date().toISOString()
    },
    {
      id: 'btcusd',
      symbol: 'BTCUSD',
      name: 'Bitcoin / US Dollar',
      timeframe: '4h',
      lotSize: 0.05,
      enabled: false,
      totalPnL: -120.30,
      winCount: 3,
      lossCount: 5,
      winRate: 37.5,
      strategy: 'MACD Trend Follow',
      rsiPeriod: 14,
      emaFast: 12,
      emaSlow: 26,
      tpPips: 150,
      slPips: 80,
      lastScanPrice: 64200.00,
      lastScanTime: new Date().toISOString()
    },
    {
      id: 'us30',
      symbol: 'US30',
      name: 'Dow Jones Industrial Average',
      timeframe: '15m',
      lotSize: 0.20,
      enabled: true,
      totalPnL: 510.00,
      winCount: 11,
      lossCount: 4,
      winRate: 73.3,
      strategy: 'NY Session Breakout',
      rsiPeriod: 14,
      emaFast: 9,
      emaSlow: 21,
      tpPips: 60,
      slPips: 30,
      lastScanPrice: 39450.00,
      lastScanTime: new Date().toISOString()
    }
  ],
  scenarios: [
    {
      id: 'scen-1001',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      symbol: 'EURUSD',
      timeframe: '15m',
      signalType: 'BUY',
      status: 'CLOSED_WIN',
      price: 1.09180,
      exitPrice: 1.09245,
      sl: 1.09030,
      tp: 1.09245,
      lotSize: 0.50,
      pnl: 325.00,
      pnlPips: 25,
      session: 'London',
      rsi: 31.4,
      emaFast: 1.09175,
      emaSlow: 1.09150,
      notes: 'RSI Oversold + EMA 9 cross above 21 during London open.',
      statusTimeline: [
        { status: 'SIGNAL_GENERATED', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
        { status: 'ORDER_PLACED', timestamp: new Date(Date.now() - 1000 * 60 * 44).toISOString() },
        { status: 'FILLED', timestamp: new Date(Date.now() - 1000 * 60 * 43).toISOString() },
        { status: 'CLOSED_WIN', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() }
      ]
    },
    {
      id: 'scen-1002',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      symbol: 'XAUUSD',
      timeframe: '5m',
      signalType: 'SELL',
      status: 'CLOSED_WIN',
      price: 2392.10,
      exitPrice: 2388.10,
      sl: 2394.60,
      tp: 2388.10,
      lotSize: 0.10,
      pnl: 400.00,
      pnlPips: 40,
      session: 'New York',
      rsi: 74.8,
      emaFast: 2391.80,
      emaSlow: 2392.50,
      notes: 'RSI Overbought rejection at resistance near NY session start.',
      statusTimeline: [
        { status: 'SIGNAL_GENERATED', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
        { status: 'ORDER_PLACED', timestamp: new Date(Date.now() - 1000 * 60 * 119).toISOString() },
        { status: 'FILLED', timestamp: new Date(Date.now() - 1000 * 60 * 118).toISOString() },
        { status: 'CLOSED_WIN', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() }
      ]
    },
    {
      id: 'scen-1003',
      timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
      symbol: 'GBPUSD',
      timeframe: '1h',
      signalType: 'BUY',
      status: 'CLOSED_LOSS',
      price: 1.27400,
      exitPrice: 1.27200,
      sl: 1.27200,
      tp: 1.27750,
      lotSize: 0.25,
      pnl: -50.00,
      pnlPips: -20,
      session: 'Asian',
      rsi: 48.2,
      emaFast: 1.27390,
      emaSlow: 1.27380,
      notes: 'Weak volume consolidation breakout during Asian session.',
      statusTimeline: [
        { status: 'SIGNAL_GENERATED', timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString() },
        { status: 'ORDER_PLACED', timestamp: new Date(Date.now() - 1000 * 60 * 199).toISOString() },
        { status: 'FILLED', timestamp: new Date(Date.now() - 1000 * 60 * 198).toISOString() },
        { status: 'CLOSED_LOSS', timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString() }
      ]
    },
    {
      id: 'scen-1004',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      symbol: 'US30',
      timeframe: '15m',
      signalType: 'BUY',
      status: 'ORDER_EXECUTED',
      price: 39420.00,
      exitPrice: null,
      sl: 39390.00,
      tp: 39480.00,
      lotSize: 0.20,
      pnl: 60.00,
      pnlPips: 30,
      session: 'New York',
      rsi: 58.6,
      emaFast: 39415.00,
      emaSlow: 39380.00,
      notes: 'NY session momentum push higher.',
      statusTimeline: [
        { status: 'SIGNAL_GENERATED', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
        { status: 'ORDER_PLACED', timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString() },
        { status: 'ORDER_EXECUTED', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString() }
      ]
    }
  ],
  logs: [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'Bot Engine initialized. Scanning 4 active assets across timeframes.',
      details: 'TradeLocker server connected in Simulation Mode.'
    }
  ],
  botState: {
    isRunning: true,
    mode: 'Simulation', // 'Simulation' or 'Live'
    scanIntervalSeconds: 15,
    lastGlobalScan: new Date().toISOString()
  }
};

class DataStore {
  constructor() {
    this.data = defaultData;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading DB file, falling back to defaults:', err);
      this.data = defaultData;
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  getAccounts() {
    return this.data.accounts;
  }

  getAssets() {
    return this.data.assets;
  }

  updateAsset(id, updates) {
    const asset = this.data.assets.find(a => a.id === id);
    if (asset) {
      Object.assign(asset, updates);
      // Recalculate win rate if stats updated
      if (asset.winCount !== undefined || asset.lossCount !== undefined) {
        const total = (asset.winCount || 0) + (asset.lossCount || 0);
        asset.winRate = total > 0 ? Number(((asset.winCount / total) * 100).toFixed(1)) : 0;
      }
      this.save();
      return asset;
    }
    return null;
  }

  getScenarios() {
    return this.data.scenarios;
  }

  addScenario(scenario) {
    const newScen = {
      id: `scen-${Date.now()}`,
      timestamp: new Date().toISOString(),
      statusTimeline: [
        { status: 'SIGNAL_GENERATED', timestamp: new Date().toISOString() }
      ],
      ...scenario
    };
    this.data.scenarios.unshift(newScen);
    this.save();
    return newScen;
  }

  updateScenarioStatus(id, newStatus, additionalData = {}) {
    const scen = this.data.scenarios.find(s => s.id === id);
    if (scen) {
      scen.status = newStatus;
      Object.assign(scen, additionalData);
      if (!scen.statusTimeline) scen.statusTimeline = [];
      scen.statusTimeline.push({
        status: newStatus,
        timestamp: new Date().toISOString()
      });

      // Update Asset total PnL if trade closed
      if (['CLOSED_WIN', 'CLOSED_LOSS'].includes(newStatus) && additionalData.pnl !== undefined) {
        const asset = this.data.assets.find(a => a.symbol === scen.symbol);
        if (asset) {
          asset.totalPnL = Number((asset.totalPnL + additionalData.pnl).toFixed(2));
          if (newStatus === 'CLOSED_WIN') asset.winCount = (asset.winCount || 0) + 1;
          if (newStatus === 'CLOSED_LOSS') asset.lossCount = (asset.lossCount || 0) + 1;
          const total = asset.winCount + asset.lossCount;
          asset.winRate = Number(((asset.winCount / total) * 100).toFixed(1));
        }
      }

      this.save();
      return scen;
    }
    return null;
  }

  getLogs() {
    return this.data.logs;
  }

  addLog(level, message, details = '') {
    const logItem = {
      id: this.data.logs.length + 1,
      timestamp: new Date().toISOString(),
      level,
      message,
      details
    };
    this.data.logs.unshift(logItem);
    if (this.data.logs.length > 200) {
      this.data.logs.pop(); // Keep last 200 logs
    }
    this.save();
    return logItem;
  }

  getBotState() {
    return this.data.botState;
  }

  updateBotState(updates) {
    Object.assign(this.data.botState, updates);
    this.save();
    return this.data.botState;
  }
}

export const db = new DataStore();
