import { db } from './db.js';
import { tradeLockerService } from './tradeLockerService.js';

export class BotEngine {
  constructor() {
    this.timer = null;
    this.isScanning = false;
  }

  start() {
    const botState = db.getBotState();
    if (this.timer) clearInterval(this.timer);

    const intervalMs = (botState.scanIntervalSeconds || 3) * 1000;
    this.timer = setInterval(() => this.runScanCycle(), intervalMs);
    console.log(`[Bot Engine] Scanning service started. Interval: ${botState.scanIntervalSeconds || 3}s`);
    db.addLog('INFO', 'Bot Engine scanner active.', `Mode: ${botState.mode}`);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log('[Bot Engine] Scanning service stopped.');
    db.addLog('WARN', 'Bot Engine paused by user.');
  }

  async runScanCycle() {
    const botState = db.getBotState();
    if (!botState.isRunning) return;
    if (this.isScanning) return;

    this.isScanning = true;
    db.updateBotState({ lastGlobalScan: new Date().toISOString() });

    try {
      // Sync real TradeLocker positions and metrics
      await db.syncLiveAccounts();

      const assets = db.getAssets().filter(a => a.enabled);
      for (const asset of assets) {
        await this.scanAsset(asset, botState.mode);
      }
    } catch (err) {
      console.error('[Bot Engine Scan Error]:', err);
    } finally {
      this.isScanning = false;
    }
  }

  async scanAsset(asset, mode) {
    const quote = await tradeLockerService.getMarketPrice(asset.symbol);
    
    db.updateAsset(asset.id, {
      lastScanPrice: quote.bid,
      lastScanTime: new Date().toISOString()
    });

    // In Live mode, only real TradeLocker signals and positions are recorded
    if (mode === 'Simulation') {
      await this.processSimulatedAssetScan(asset, quote);
    }
  }

  async processSimulatedAssetScan(asset, quote) {
    const rsi = Number((30 + Math.random() * 40).toFixed(1));
    const emaFast = quote.bid;
    const emaSlow = quote.bid;

    let signalType = null;
    let signalReason = '';

    if (rsi < 32) {
      signalType = 'BUY';
      signalReason = `RSI Oversold (${rsi}) + EMA Cross Up on ${asset.timeframe}`;
    } else if (rsi > 68) {
      signalType = 'SELL';
      signalReason = `RSI Overbought (${rsi}) + EMA Cross Down on ${asset.timeframe}`;
    }

    if (signalType) {
      const pipsCalc = asset.symbol.includes('JPY') ? 0.01 : (asset.symbol.includes('XAU') || asset.symbol.includes('US') || asset.symbol.includes('BTC') ? 1.0 : 0.0001);
      const slDist = (asset.slPips || 20) * pipsCalc;
      const tpDist = (asset.tpPips || 30) * pipsCalc;
      const price = quote.bid;
      const sl = signalType === 'BUY' ? Number((price - slDist).toFixed(4)) : Number((price + slDist).toFixed(4));
      const tp = signalType === 'BUY' ? Number((price + tpDist).toFixed(4)) : Number((price - tpDist).toFixed(4));

      db.addScenario({
        symbol: asset.symbol,
        timeframe: asset.timeframe,
        signalType,
        status: 'ORDER_EXECUTED',
        price,
        sl,
        tp,
        lotSize: asset.lotSize,
        pnl: 0,
        session: 'New York',
        rsi,
        emaFast,
        emaSlow,
        notes: signalReason
      });
    }
  }
}

export const botEngine = new BotEngine();
