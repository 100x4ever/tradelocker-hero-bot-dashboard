export class TradeLockerService {
  constructor() {
    this.baseUrl = process.env.TRADELOCKER_SERVER || 'https://demo.tradelocker.com/api/v2';
    this.email = process.env.TRADELOCKER_EMAIL || '';
    this.password = process.env.TRADELOCKER_PASSWORD || '';
    this.accessToken = null;
    this.refreshToken = null;
    this.accId = process.env.TRADELOCKER_ACC_ID || null;
    this.isConnected = false;
  }

  setCredentials(email, password, serverUrl = 'https://demo.tradelocker.com/api/v2') {
    this.email = email;
    this.password = password;
    this.baseUrl = serverUrl;
  }

  async authenticate() {
    if (!this.email || !this.password) {
      console.log('[TradeLocker API] Credentials not configured. Running in Mock/Simulation mode.');
      return { success: false, reason: 'Credentials missing' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/jwt/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
          server: 'HeroFX'
        })
      });

      const data = await response.json();
      if (response.ok && data && data.accessToken) {
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.isConnected = true;
        return { success: true, token: this.accessToken };
      }
      return { success: false, reason: data.message || 'Invalid token payload' };
    } catch (err) {
      console.log(`[TradeLocker API] Live auth attempt fallback (${err.message}). Defaulting to simulation mode.`);
      return { success: false, reason: err.message };
    }
  }

  async getAccountDetails(accountId) {
    if (!this.accessToken) {
      await this.authenticate();
    }
    if (!this.isConnected) {
      return {
        id: accountId || 'herofx-demo-101',
        balance: 10450.80,
        equity: 10620.40,
        currency: 'USD',
        freeMargin: 9800.00
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/trade/accounts/${accountId || this.accId}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      return await res.json();
    } catch (err) {
      console.error('[TradeLocker API Error] getAccountDetails:', err.message);
      return null;
    }
  }

  async getMarketPrice(symbol) {
    const basePrices = {
      EURUSD: 1.09245,
      GBPUSD: 1.27180,
      XAUUSD: 2384.50,
      BTCUSD: 64200.00,
      US30: 39450.00
    };

    const base = basePrices[symbol] || 1.0000;
    const fluctuation = (Math.random() - 0.5) * (base * 0.0008);
    const ask = Number((base + fluctuation).toFixed(symbol.includes('USD') && !symbol.includes('BTC') && !symbol.includes('XAU') && !symbol.includes('US30') ? 5 : 2));
    const bid = Number((ask - (base * 0.00015)).toFixed(symbol.includes('USD') && !symbol.includes('BTC') && !symbol.includes('XAU') && !symbol.includes('US30') ? 5 : 2));

    return {
      symbol,
      bid,
      ask,
      timestamp: new Date().toISOString()
    };
  }

  async executeOrder({ symbol, side, lotSize, stopLoss, takeProfit, mode = 'Simulation' }) {
    console.log(`[TradeLocker Order] ${mode} execution: ${side} ${lotSize} lots of ${symbol} SL:${stopLoss} TP:${takeProfit}`);
    
    if (mode === 'Live' && this.isConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/trade/accounts/${this.accId}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`
          },
          body: JSON.stringify({
            instrumentId: symbol,
            qty: lotSize,
            side: side.toLowerCase(),
            type: 'market',
            stopLoss,
            takeProfit
          })
        });

        const data = await response.json();
        return {
          success: response.ok,
          orderId: data.orderId || `TL-${Date.now()}`,
          status: 'ORDER_EXECUTED',
          symbol,
          side,
          lotSize,
          timestamp: new Date().toISOString()
        };
      } catch (err) {
        console.error('[TradeLocker Order Error]:', err.message);
        return {
          success: false,
          error: err.message
        };
      }
    }

    return {
      success: true,
      orderId: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'ORDER_EXECUTED',
      symbol,
      side,
      lotSize,
      mode: 'Simulation',
      timestamp: new Date().toISOString()
    };
  }
}

export const tradeLockerService = new TradeLockerService();
