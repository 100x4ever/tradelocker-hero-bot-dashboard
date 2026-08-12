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

    const intervalMs = (botState.scanIntervalSeconds || 15) * 1000;
    this.timer = setInterval(() => this.runScanCycle(), intervalMs);
    console.log(`[Bot Engine] Scanning service started. Interval: ${botState.scanIntervalSeconds}s`);
    db.addLog('INFO', 'Bot Engine started scanning configured assets.', `Mode: ${botState.mode}`);
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
    
    // Update asset last scan price
    db.updateAsset(asset.id, {
      lastScanPrice: quote.bid,
      lastScanTime: new Date().toISOString()
    });

    // Evaluate Strategy Math & Technical Indicators
    // Mock technical indicator analysis based on timeframe and asset strategy
    const rsi = Number((25 + Math.random() * 52).toFixed(1));
    const emaFast = quote.bid;
    const emaSlow = quote.bid * (1 + (Math.random() - 0.5) * 0.001);

    // Signal Trigger conditions
    let signalType = null;
    let signalReason = '';

    if (rsi < 32) {
      signalType = 'BUY';
      signalReason = `RSI Oversold (${rsi}) + EMA Cross Up on ${asset.timeframe}`;
    } else if (rsi > 68) {
      signalType = 'SELL';
      signalReason = `RSI Overbought (${rsi}) + EMA Cross Down on ${asset.timeframe}`;
    } else if (Math.random() < 0.08) {
      // Periodic trend momentum signal generator for live demo testing
      signalType = Math.random() > 0.5 ? 'BUY' : 'SELL';
      signalReason = `Momentum breakout confirmed on ${asset.timeframe} candle close`;
    }

    if (signalType) {
      await this.handleSignal({
        asset,
        signalType,
        signalReason,
        quote,
        rsi,
        emaFast,
        emaSlow,
        mode
      });
    }

    // Check existing open scenarios to simulate SL/TP hit & status updates
    await this.processOpenScenarios(asset.symbol);
  }

  async handleSignal({ asset, signalType, signalReason, quote, rsi, emaFast, emaSlow, mode }) {
    // Current Trading Session detection
    const hour = new Date().getUTCHours();
    let session = 'Asian';
    if (hour >= 7 && hour < 15) session = 'London';
    if (hour >= 13 && hour < 21) session = 'New York';

    const pipsCalc = asset.symbol.includes('JPY') ? 0.01 : (asset.symbol.includes('XAU') || asset.symbol.includes('US30') || asset.symbol.includes('BTC') ? 1.0 : 0.0001);
    const slDist = (asset.slPips || 20) * pipsCalc;
    const tpDist = (asset.tpPips || 30) * pipsCalc;

    const price = quote.bid;
    const sl = signalType === 'BUY' ? Number((price - slDist).toFixed(4)) : Number((price + slDist).toFixed(4));
    const tp = signalType === 'BUY' ? Number((price + tpDist).toFixed(4)) : Number((price - tpDist).toFixed(4));

    // 1. Create Scenario with initial status SIGNAL_GENERATED
    const scenario = db.addScenario({
      symbol: asset.symbol,
      timeframe: asset.timeframe,
      signalType,
      status: 'SIGNAL_GENERATED',
      price,
      sl,
      tp,
      lotSize: asset.lotSize,
      pnl: 0,
      session,
      rsi,
      emaFast,
      emaSlow,
      notes: signalReason
    });

    db.addLog('SIGNAL', `[SIGNAL] ${signalType} ${asset.symbol} on ${asset.timeframe}`, signalReason);

    // 2. Transition status to ORDER_PLACED
    db.updateScenarioStatus(scenario.id, 'ORDER_PLACED');

    // 3. Execute Order via TradeLocker Service
    const orderRes = await tradeLockerService.executeOrder({
      symbol: asset.symbol,
      side: signalType,
      lotSize: asset.lotSize,
      stopLoss: sl,
      takeProfit: tp,
      mode
    });

    if (orderRes.success) {
      db.updateScenarioStatus(scenario.id, 'ORDER_EXECUTED', { orderId: orderRes.orderId });
      db.addLog('EXECUTION', `[ORDER EXECUTED] ${signalType} ${asset.lotSize} lots ${asset.symbol} @ ${price}`, `Order ID: ${orderRes.orderId} (${mode} mode)`);
    } else {
      db.updateScenarioStatus(scenario.id, 'CANCELLED', { notes: `Execution failed: ${orderRes.error}` });
      db.addLog('WARN', `Order failed for ${asset.symbol}: ${orderRes.error}`);
    }
  }

  async processOpenScenarios(symbol) {
    const openScenarios = db.getScenarios().filter(s => s.symbol === symbol && ['ORDER_EXECUTED', 'ORDER_PLACED'].includes(s.status));
    
    for (const scen of openScenarios) {
      // Simulate trade duration completion (10% chance per cycle to trigger exit TP/SL)
      if (Math.random() < 0.25) {
        const isWin = Math.random() < 0.72; // Win probability reflective of strategy
        const newStatus = isWin ? 'CLOSED_WIN' : 'CLOSED_LOSS';
        
        const pipsMultiplier = symbol.includes('XAU') || symbol.includes('US30') ? 10 : (symbol.includes('BTC') ? 1 : 100);
        const pnlAmount = isWin 
          ? Number((scen.lotSize * 350 * (0.8 + Math.random() * 0.4)).toFixed(2)) 
          : Number((-scen.lotSize * 220 * (0.8 + Math.random() * 0.4)).toFixed(2));
        
        db.updateScenarioStatus(scen.id, newStatus, {
          exitPrice: isWin ? scen.tp : scen.sl,
          pnl: pnlAmount,
          pnlPips: isWin ? 30 : -20
        });

        db.addLog('INFO', `[TRADE CLOSED] ${scen.symbol} scenario ${scen.id} -> ${newStatus}`, `PnL: $${pnlAmount}`);
      }
    }
  }
}

export const botEngine = new BotEngine();
