import React, { useState, useEffect } from 'react';
import { Camera, Download, RefreshCw, Layers, Clock, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function SnapshotLogsView() {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = async () => {
    try {
      const res = await fetch('/api/snapshots');
      if (res.ok) {
        const data = await res.json();
        setSnapshots(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerManualSnapshot = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/snapshots/trigger', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSnapshots(data.snapshots || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    window.location.href = '/api/snapshots/export';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Actions */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-lg text-white">15-Minute Market & Indicator Snapshots</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated 15m snapshots capturing 5m Base indicators, Mid-Price Limit order setups, and execution logs
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              onClick={triggerManualSnapshot}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-300 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Generating Snapshot...' : 'Trigger 15m Snapshot Now'}</span>
            </button>

            <button
              onClick={downloadCSV}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Snapshots CSV</span>
            </button>
          </div>
        </div>

        {/* Snapshot Summary Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-slate-300">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-500">Base Timeframe:</span>
            <span className="font-bold text-indigo-400">5m Base Candles</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-500">Limit Price Model:</span>
            <span className="font-bold text-purple-400">Mid Price ((Bid+Ask)/2)</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-500">Logged Snapshots:</span>
            <span className="font-bold text-emerald-400">{snapshots.length} Snapshots</span>
          </div>
        </div>
      </div>

      {/* Snapshot Cards Feed */}
      <div className="space-y-4">
        {snapshots.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 border border-slate-800 text-center space-y-3">
            <Camera className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-300">No 15m Snapshots Logged Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click 'Trigger 15m Snapshot Now' above to generate an instant technical and setup snapshot for NAS100, RUS2000, and EURUSD.
            </p>
          </div>
        ) : (
          snapshots.map((snap) => (
            <div key={snap.id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-base text-white">{snap.symbol}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 font-bold">
                    5m Base
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                    snap.htfBias === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    snap.htfBias === 'BEARISH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    5m Bias: {snap.htfBias}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(snap.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Indicators Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">MID PRICE</span>
                  <span className="font-bold text-white text-sm">{snap.currentPrice}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">20 EMA (5m)</span>
                  <span className="font-bold text-indigo-300">{snap.ema20}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">SESSION VWAP</span>
                  <span className="font-bold text-amber-300">{snap.vwap}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">RSI (14)</span>
                  <span className={`font-bold ${snap.rsi > 70 ? 'text-rose-400' : snap.rsi < 30 ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {snap.rsi}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">STOCH %K / %D</span>
                  <span className="font-bold text-purple-300">{snap.stochK} / {snap.stochD}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ATR (14)</span>
                  <span className="font-bold text-slate-300">{snap.atr}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">FLOATING PNL</span>
                  <span className={`font-bold ${snap.floatingPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {snap.floatingPnL >= 0 ? '+' : ''}${snap.floatingPnL?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Setups In Progress / Waiting Section */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs text-amber-300">Setups In Progress / Monitoring Status</span>
                </div>

                <div className="space-y-1.5 pl-6">
                  {(snap.pendingSetups || []).map((setup, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-slate-300 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>{setup}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
