import React, { useState, useEffect } from 'react';
import { X, Save, Settings2, Sliders, ShieldAlert } from 'lucide-react';

export default function AssetConfigModal({ asset, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    timeframe: '15m',
    lotSize: 0.1,
    enabled: true,
    strategy: 'EMA & RSI Momentum',
    rsiPeriod: 14,
    emaFast: 9,
    emaSlow: 21,
    tpPips: 25,
    slPips: 15
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        symbol: asset.symbol || '',
        name: asset.name || '',
        timeframe: asset.timeframe || '15m',
        lotSize: asset.lotSize || 0.1,
        enabled: asset.enabled !== undefined ? asset.enabled : true,
        strategy: asset.strategy || 'EMA & RSI Momentum',
        rsiPeriod: asset.rsiPeriod || 14,
        emaFast: asset.emaFast || 9,
        emaSlow: asset.emaSlow || 21,
        tpPips: asset.tpPips || 25,
        slPips: asset.slPips || 15
      });
    }
  }, [asset]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(asset ? asset.id : null, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                {asset ? `Configure Asset: ${asset.symbol}` : 'Add New Trading Asset'}
              </h3>
              <p className="text-xs text-slate-400">Adjust timeframe scan rate, lot sizing, and strategy rules</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Symbol & Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Asset Symbol
              </label>
              <input
                type="text"
                disabled={!!asset}
                value={formData.symbol}
                onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                placeholder="e.g. EURUSD, XAUUSD"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Description / Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Euro / US Dollar"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Timeframe & Lot Size */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Scanner Timeframe
              </label>
              <select
                value={formData.timeframe}
                onChange={e => setFormData({ ...formData, timeframe: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="1m">1 Minute (1m)</option>
                <option value="5m">5 Minutes (5m)</option>
                <option value="15m">15 Minutes (15m)</option>
                <option value="1h">1 Hour (1h)</option>
                <option value="4h">4 Hours (4h)</option>
                <option value="1d">1 Day (1d)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Bot checks market candles on this timeframe</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Lot Size per Trade
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="50.0"
                value={formData.lotSize}
                onChange={e => setFormData({ ...formData, lotSize: parseFloat(e.target.value) || 0.01 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Fixed lot volume dispatched to TradeLocker</p>
            </div>
          </div>

          {/* Strategy & Risk Rules */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Trading Strategy Preset
            </label>
            <select
              value={formData.strategy}
              onChange={e => setFormData({ ...formData, strategy: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="EMA & RSI Momentum">EMA & RSI Momentum Crossover</option>
              <option value="Breakout & Trend">Breakout & Support/Resistance</option>
              <option value="Scalp RSI Oversold">Scalp RSI Oversold / Overbought</option>
              <option value="MACD Trend Follow">MACD Histogram Trend Follow</option>
            </select>
          </div>

          {/* Technical Indicator Parameters */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-indigo-400" />
              <span>Indicator Parameters & SL/TP Rules</span>
            </h4>
            <div className="grid grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">RSI Period</label>
                <input
                  type="number"
                  value={formData.rsiPeriod}
                  onChange={e => setFormData({ ...formData, rsiPeriod: parseInt(e.target.value) || 14 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Fast EMA</label>
                <input
                  type="number"
                  value={formData.emaFast}
                  onChange={e => setFormData({ ...formData, emaFast: parseInt(e.target.value) || 9 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Take Profit (Pips)</label>
                <input
                  type="number"
                  value={formData.tpPips}
                  onChange={e => setFormData({ ...formData, tpPips: parseInt(e.target.value) || 25 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Stop Loss (Pips)</label>
                <input
                  type="number"
                  value={formData.slPips}
                  onChange={e => setFormData({ ...formData, slPips: parseInt(e.target.value) || 15 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Active Scanner Toggle */}
          <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-sm font-semibold text-slate-200">Scanner Status</span>
              <p className="text-xs text-slate-400">Enable automated bot scanning for this asset</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.enabled}
                onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Configurations</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
