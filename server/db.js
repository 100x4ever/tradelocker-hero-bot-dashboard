import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { tradeLockerService } from './tradeLockerService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'data_store.json');

const defaultData = {
  accounts: [
    {
      id: 'herofx-primary',
      name: 'HeroFX TradeLocker Account',
      broker: 'HeroFX (TradeLocker)',
      accNumber: 'Awaiting Connection',
      type: 'Live',
      server: 'https://live.tradelocker.com/api/v2',
      balance: 0.00,
      equity: 0.00,
      dailyPnL: 0.00,
      weeklyPnL: 0.00,
      totalPnL: 0.00,
      winRate: 0,
      totalTrades: 0,
      status: 'Disconnected (Enter Credentials in Settings)'
    }
  ],
  assets: [
    {
      id: 'eurusd',
      symbol: 'EURUSD',
      name: 'Euro / US Dollar',
      timeframe: '15m',
      lotSize: 0.10,
      enabled: true,
      totalPnL: 0.00,
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
    },
    {
      id: 'gbpusd',
      symbol: 'GBPUSD',
      name: 'British Pound / US Dollar',
      timeframe: '1h',
      lotSize: 0.10,
      enabled: true,
      totalPnL: 0.00,
      winCount: 0,
      lossCount: 0,
      winRate: 0,
      strategy: 'Breakout & Trend',
      rsiPeriod: 14,
      emaFast: 12,
      emaSlow: 26,
      tpPips: 35,
      slPips: 20,
      lastScanPrice: 0,
      lastScanTime: new Date().toISOString()
    },
    {
      id: 'xauusd',
      symbol: 'XAUUSD',
      name: 'Gold / US Dollar',
      timeframe: '5m',
      lotSize: 0.05,
      enabled: true,
      totalPnL: 0.00,
      winCount: 0,
      lossCount: 0,
      winRate: 0,
      strategy: 'Scalp RSI Oversold',
      rsiPeriod: 7,
      emaFast: 5,
      emaSlow: 15,
      tpPips: 40,
      slPips: 25,
      lastScanPrice: 0,
      lastScanTime: new Date().toISOString()
    },
    {
      id: 'us30',
      symbol: 'US30',
      name: 'Dow Jones Industrial Average',
      timeframe: '15m',
      lotSize: 0.05,
      enabled: true,
      totalPnL: 0.00,
      winCount: 0,
      lossCount: 0,
      winRate: 0,
      strategy: 'NY Session Breakout',
      rsiPeriod: 14,
      emaFast: 9,
      emaSlow: 21,
      tpPips: 60,
      slPips: 30,
      lastScanPrice: 0,
      lastScanTime: new Date().toISOString()
    }
  ],
  scenarios: [],
  logs: [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'System ready. Enter TradeLocker credentials to sync live HeroFX account.',
      details: 'TradeLocker REST API Engine Initialized.'
    }
  ],
  botState: {
    isRunning: true,
    mode: 'Live',
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
      console.error('Error loading DB file, using defaults:', err);
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

  async syncLiveAccounts() {
    if (tradeLockerService.isConnected) {
      const realAccounts = await tradeLockerService.fetchAccounts();
      if (realAccounts && realAccounts.length > 0) {
        this.data.accounts = realAccounts;
        this.save();
        return realAccounts;
      }
    }
    return this.data.accounts;
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
      this.data.logs.pop();
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
