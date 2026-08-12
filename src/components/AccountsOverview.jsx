import React, { useState } from 'react';
import { Layers, Award, Activity, Edit2, Check, Sliders, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../services/api';

export default function AccountsOverview({ assets = [], positions = [], onEditAsset }) {
  const [editingLotSymbol, setEditingLotSymbol] = useState(null);
  const [tempLotSize, setTempLotSize] = useState('');

  const defaultAssets = [
    { id: 'nas100', symbol: 'NAS100', name: 'US Tech 100 Index', timeframe: '5m', lotSize: 0.17, preferredLotSize: 0.17, totalPnL: 0.79, winCount: 2, lossCount: 1, winRate: 66.7 },
    { id: 'rus2000', symbol: 'RUS2000', name: 'US SmallCap 2000 Index', timeframe: '5m', lotSize: 1.60, preferredLotSize: 1.60, totalPnL: 0.00, winCount: 1, lossCount: 0, winRate: 100.0 },
    { id: 'eurusd', symbol: 'EURUSD', name: 'Euro / US Dollar', timeframe: '5m', lotSize: 0.10, preferredLotSize: 0.10, totalPnL: 0.00, winCount: 1, lossCount: 0, winRate: 100.0 }
  ];

  const displayAssets = assets.length > 0 ? assets : defaultAssets;

  const handleStartEditLot = (asset) => {
    setEditingLotSymbol(asset.symbol);
    setTempLotSize(String(asset.lotSize || asset.preferredLotSize || 0.01));
  };

  const handleSaveLotSize = async (asset) => {
    const newLot = Number(tempLotSize);
    if (!isNaN(newLot) && newLot > 0) {
      try {
        await api.updateAsset(asset.id, { lotSize: newLot, preferredLotSize: newLot });
        asset.lotSize = newLot;
        asset.preferredLotSize = newLot;
      } catch (err) {
        console.error(err);
      }
    }
    setEditingLotSymbol(null);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-900">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-xl text-white">Asset Performance & Position Cards</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time open PnL, overall PnL, win/loss fractions, and adjustable lot sizes for NAS100, RUS2000, and EURUSD
          </p>
        </div>
      </div>

      {/* 3 Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayAssets.map((asset) => {
          const openPosition = (positions || []).find(p => p.symbol === asset.symbol);
          const openPnL = openPosition ? openPosition.unrealizedPnL || 0 : 0.00;
          const hasOpenPosition = !!openPosition;

          const totalTrades = (asset.winCount || 0) + (asset.lossCount || 0);
          const winLossFraction = `${asset.winCount || 0}W / ${asset.lossCount || 0}L`;
          const winFractionStr = `${asset.winCount || 0}/${totalTrades > 0 ? totalTrades : 1} wins`;
          const isTotalProfit = asset.totalPnL >= 0;
          const currentLot = asset.lotSize || asset.preferredLotSize || 0.01;

          return (
            <div
              key={asset.id || asset.symbol}
              className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5 hover:border-slate-700 transition-all shadow-2xl relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                isTotalProfit ? 'bg-gradient-to-r from-indigo-500 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-amber-500'
              }`}></div>

              {/* Card Title & Live Position Status */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-2xl tracking-tight text-white">{asset.symbol}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-[11px] font-bold">
                      {asset.timeframe || '5m'} Base
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{asset.name}</p>
                </div>

                <div className={`px-3 py-1 rounded-full font-mono text-xs font-bold flex items-center space-x-1.5 ${
                  hasOpenPosition
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  <Activity className="w-3.5 h-3.5" />
                  <span>{hasOpenPosition ? `${openPosition.side} ${openPosition.qty}L` : 'No Open Position'}</span>
                </div>
              </div>

              {/* Adjustable Lot Size Control */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Trade Lot Size:</span>
                </span>

                {editingLotSymbol === asset.symbol ? (
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={tempLotSize}
                      onChange={e => setTempLotSize(e.target.value)}
                      className="w-20 bg-slate-900 border border-indigo-500 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveLotSize(asset)}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-md"
                      title="Save Lot Size"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-extrabold text-base text-indigo-300">
                      {currentLot} lots
                    </span>
                    <button
                      onClick={() => handleStartEditLot(asset)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Adjust Lot Size"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* PnL Metrics: Open Position PnL vs Overall PnL */}
              <div className="grid grid-cols-2 gap-3.5">
                
                {/* Open Position PnL */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    OPEN POSITION PNL
                  </span>
                  <span className={`text-xl font-extrabold font-mono block ${
                    openPnL > 0 ? 'text-emerald-400' : openPnL < 0 ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {openPnL >= 0 ? '+' : ''}${openPnL.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {hasOpenPosition ? `Entry @ ${openPosition.openPrice}` : 'Waiting for trigger'}
                  </span>
                </div>

                {/* Overall All-Time PnL */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    OVERALL TOTAL PNL
                  </span>
                  <span className={`text-xl font-extrabold font-mono block ${
                    isTotalProfit ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isTotalProfit ? '+' : ''}${asset.totalPnL?.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Closed net profit
                  </span>
                </div>

              </div>

              {/* Success Rate % & Win/Loss Fraction */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>Win / Loss Ratio</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {asset.winRate || 100}% <span className="text-indigo-400">({winLossFraction} • {winFractionStr})</span>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(asset.winRate || 100, 100)}%` }}
                  ></div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
