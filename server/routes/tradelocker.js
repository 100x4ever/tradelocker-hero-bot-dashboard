import express from 'express';
import { tradeLockerService } from '../tradeLockerService.js';
import { db } from '../db.js';

const router = express.Router();

// GET TradeLocker API connection status
router.get('/status', (req, res) => {
  res.json({
    isConnected: tradeLockerService.isConnected,
    baseUrl: tradeLockerService.baseUrl,
    email: tradeLockerService.email ? `${tradeLockerService.email.substring(0, 3)}***` : 'Not Set',
    accId: tradeLockerService.accId || 'Default Demo'
  });
});

// POST Authenticate TradeLocker credentials
router.post('/auth', async (req, res) => {
  const { email, password, serverUrl } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  tradeLockerService.setCredentials(email, password, serverUrl || 'https://demo.tradelocker.com/api/v2');
  const result = await tradeLockerService.authenticate();

  if (result.success) {
    db.addLog('INFO', 'Successfully authenticated with TradeLocker HeroFX API', `Server: ${serverUrl}`);
    res.json({ success: true, message: 'Connected to TradeLocker API successfully!' });
  } else {
    db.addLog('WARN', 'TradeLocker API authentication failed', result.reason);
    res.status(401).json({ success: false, error: result.reason || 'Authentication failed' });
  }
});

export default router;
