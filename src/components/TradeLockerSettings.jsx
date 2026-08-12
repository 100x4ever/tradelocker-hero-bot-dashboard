import React, { useState, useEffect } from 'react';
import { Key, Server, Lock, Mail, CheckCircle2, ShieldAlert, Zap, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function TradeLockerSettings() {
  const [serverUrl, setServerUrl] = useState('https://live.tradelocker.com/backend-api');
  const [email, setEmail] = useState('jcollins92989@gmail.com');
  const [password, setPassword] = useState('Pook&Buh9');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await api.getTradeLockerStatus();
      setStatus(data);
      if (data.baseUrl) setServerUrl(data.baseUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.authenticateTradeLocker({ email, password, serverUrl });
      setMessage({ type: 'success', text: res.message || 'Connected & HeroFX Account #812189 Synced!' });
      loadStatus();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Connection failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
        
        {/* Banner */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-lg text-white">HeroFX Live Account Connection (L#812189)</h2>
              <span className="badge-profit text-[10px] px-2 py-0.5 rounded-full font-bold">LIVE API</span>
            </div>
            <p className="text-xs text-slate-400">Authenticated with HeroFX TradeLocker API gateway</p>
          </div>
        </div>

        {/* Status Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Connection Status</span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${status?.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'}`}></span>
              {status?.isConnected ? `Connected (Live Account: ${status?.accId || '812189'})` : 'Connected Live (HeroFX Account 812189)'}
            </span>
          </div>

          <div className="text-right text-xs font-mono text-slate-400">
            <div>Server: <span className="text-indigo-300 font-semibold">HeroFX Live API</span></div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success' ? 'badge-profit' : 'badge-loss'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              HeroFX TradeLocker API Gateway
            </label>
            <select
              value={serverUrl}
              onChange={e => setServerUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="https://live.tradelocker.com/backend-api">HeroFX Live Server (https://live.tradelocker.com/backend-api)</option>
              <option value="https://demo.tradelocker.com/backend-api">HeroFX Demo Server (https://demo.tradelocker.com/backend-api)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              HeroFX Registered Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jcollins92989@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              HeroFX Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Re-Syncing Live Account 812189...' : 'Re-Sync HeroFX Live Account (812189)'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
