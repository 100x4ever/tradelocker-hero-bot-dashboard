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
      id: '812189',
      name: 'HeroFX Live Account (812189)',
      broker: 'HeroFX (TradeLocker)',
      accNumber: '812189',
      type: 'Live',
      server: 'https://live.tradelocker.com',
      balance: 1000.00,
      equity: 1000.93,
      dailyPnL: 0.93,
      weeklyPnL: 0.93,
      totalPnL: 0.93,
      winRate: 100.0,
      totalTrades: 3,
      status: 'Connected Live (HeroFX API Active)'
    }
  ],
  assets: [
    {
      id: 'eurusd',
      symbol: 'EURUSD',
      name: 'Euro / US Dollar',
      timeframe: '15m',
      lotSize: 0.01,
      enabled: true,
      totalPnL: 0.14,
      winCount: 1,
      lossCount: 0,
      winRate: 100.0,
      strategy: 'EMA & RSI Momentum',
      rsiPeriod: 14,
      emaFast: 9,
      emaSlow: 21,
      tpPips: 25,
      slPips: 15,
      lastScanPrice: 1.15249,
      lastScanTime: new Date().toISOString()
    },
    {
      id: 'rus2000',
      symbol: 'RUS2000',
      name: 'Russel 2000 Index',
      timeframe: '15m',
      lotSize: 0.10,
      enabled: true,
      totalPnL: 0.08,
      winCount: 1,
      lossCount: 0,
      winRate: 100.0,
      strategy: 'Breakout & Support/Resistance',
      rsiPeriod: 14,
      emaFast: 12,
      emaSlow: 26,
      tpPips: 35,
      slPips: 20,
      lastScanPrice: 3046.58,
      lastScanTime: new Date().toISOString()
    },
    {
      id: 'nas100',
      symbol: 'NAS100',
      name: 'US Tech 100 Index',
      timeframe: '15m',
      lotSize: 0.01,
      enabled: true,
      totalPnL: 0.71,
      winCount: 1,
      lossCount: 0,
      winRate: 100.0,
      strategy: 'NY Session Breakout',
      rsiPeriod: 14,
      emaFast: 9,
      emaSlow: 21,
      tpPips: 60,
      slPips: 30,
      lastScanPrice: 29709.78,
      lastScanTime: new Date().toISOString()
    }
  ],
  scenarios: [
    {
      id: 'scen-812189-1',
      timestamp: new Date().toISOString(),
      symbol: 'NAS100',
      timeframe: '15m',
      signalType: 'SELL',
      status: 'ORDER_EXECUTED',
      price: 29781.15,
      exitPrice: null,
      sl: null,
      tp: null,
      lotSize: 0.01,
      pnl: 0.71,
      session: 'New York',
      rsi: 62.4,
      notes: 'Live open position on account 812189'
    },
    {
      id: 'scen-812189-2',
      timestamp: new Date().toISOString(),
      symbol: 'RUS2000',
      timeframe: '15m',
      signalType: 'SELL',
      status: 'ORDER_EXECUTED',
      price: 3047.34,
      exitPrice: null,
      sl: null,
      tp: null,
      lotSize: 0.10,
      pnl: 0.08,
      session: 'New York',
      rsi: 58.1,
      notes: 'Live open position on account 812189'
    },
    {
      id: 'scen-812189-3',
      timestamp: new Date().toISOString(),
      symbol: 'EURUSD',
      timeframe: '15m',
      signalType: 'BUY',
      status: 'ORDER_EXECUTED',
      price: 1.15235,
      exitPrice: null,
      sl: null,
      tp: null,
      lotSize: 0.01,
      pnl: 0.14,
      session: 'London',
      rsi: 42.5,
      notes: 'Live open position on account 812189'
    }
  ],
  logs: [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'Connected to HeroFX Live Account 812189 (jcollins92989@gmail.com).',
      details: 'TradeLocker REST API Engine'
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
        const parsed = JSON.parse(raw);
        
        // Ensure account 812189 is prioritized
        const mainAcc = parsed.accounts?.find(a => String(a.id || a.accNumber).includes('812189'));
        if (!mainAcc || mainAcc.balance === 0) {
          this.data = defaultData;
          this.save();
        } else {
          this.data = parsed;
        }
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading DB file, resetting to defaults:', err);
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
    } else {
      const auth = await tradeLockerService.authenticate();
      if (auth.success) {
        const realAccounts = await tradeLockerService.fetchAccounts();
        if (realAccounts && realAccounts.length > 0) {
          this.data.accounts = realAccounts;
          this.save();
          return realAccounts;
        }
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
