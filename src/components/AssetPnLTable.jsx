import React from 'react';
import { Sliders, Plus, CheckCircle2, XCircle, TrendingUp, TrendingDown, Clock, Layers } from 'lucide-react';

export default function AssetPnLTable({ assets, onEditAsset, onAddNewAsset, onToggleAssetStatus }) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800">
      
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Assets Scanner & Lot Sizing Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure scan timeframes, lot sizes, and view real-time asset total PnL
          </p>
        </div>

        <button
          onClick={onAddNewAsset}
          className="px-4 py-2 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset Pair</span>
        </button>
      </div>

      {/* Asset Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 bg-slate-900/40">
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Asset Pair</th>
              <th className="py-3 px-4">Scan Timeframe</th>
              <th className="py-3 px-4">Lot Size</th>
              <th className="py-3 px-4">Strategy</th>
              <th className="py-3 px-4">Win / Loss</th>
              <th className="py-3 px-4">Win Rate %</th>
              <th className="py-3 px-4 text-right">Total PnL ($)</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {assets.map(asset => {
              const isProfit = asset.totalPnL >= 0;
              return (
                <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors group">
                  
                  {/* Status Toggle */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleAssetStatus(asset.id, !asset.enabled)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                        asset.enabled
                          ? 'badge-profit hover:bg-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {asset.enabled ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Scanning</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Paused</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Asset Symbol & Name */}
                  <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-indigo-300">{asset.symbol}</span>
                      <span className="text-xs text-slate-500 font-normal">({asset.name})</span>
                    </div>
                  </td>

                  {/* Timeframe */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-900 text-indigo-300 border border-slate-800 flex items-center w-fit gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      {asset.timeframe}
                    </span>
                  </td>

                  {/* Lot Size */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200 whitespace-nowrap">
                    {asset.lotSize?.toFixed(2)} lots
                  </td>

                  {/* Strategy */}
                  <td className="py-3.5 px-4 text-xs text-slate-300 whitespace-nowrap">
                    {asset.strategy}
                  </td>

                  {/* Win / Loss Record */}
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-300 whitespace-nowrap">
                    <span className="text-emerald-400 font-semibold">{asset.winCount || 0}W</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span className="text-rose-400 font-semibold">{asset.lossCount || 0}L</span>
                  </td>

                  {/* Win Rate % Bar */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-900 rounded-full h-2 border border-slate-800 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, asset.winRate || 0)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {asset.winRate ? `${asset.winRate}%` : '0%'}
                      </span>
                    </div>
                  </td>

                  {/* Asset Total PnL */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-extrabold text-base">
                    <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                      {isProfit ? '+' : ''}${asset.totalPnL?.toFixed(2)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => onEditAsset(asset)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-slate-700 transition-all text-xs flex items-center justify-center mx-auto space-x-1"
                      title="Edit timeframe and lot size"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
