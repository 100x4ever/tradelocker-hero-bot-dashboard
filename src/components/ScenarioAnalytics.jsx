import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Sparkles, 
  Layers, 
  ChevronRight,
  Info,
  Calendar
} from 'lucide-react';

export default function ScenarioAnalytics({ scenarios, analytics, onFilterChange }) {
  const [selectedSymbol, setSelectedSymbol] = useState('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedScenario, setSelectedScenario] = useState(null);

  const handleFilterUpdate = (symbol, tf, status) => {
    setSelectedSymbol(symbol);
    setSelectedTimeframe(tf);
    setSelectedStatus(status);
    onFilterChange({ symbol, timeframe: tf, status });
  };

  const handleExportCSV = () => {
    window.open('/api/scenarios/export', '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Scenario Success Analytics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Success Rate by Timeframe */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Win Rate by Timeframe</span>
            </h3>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Best Timeframes</span>
          </div>

          <div className="mt-3.5 space-y-3">
            {analytics?.byTimeframe?.map(item => (
              <div key={item.key} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-slate-900 font-mono font-semibold text-indigo-300 border border-slate-800">
                    {item.key}
                  </span>
                  <span className="text-slate-400">({item.wins}W / {item.losses}L)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`font-mono font-bold ${item.winRate >= 70 ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {item.winRate}%
                  </span>
                  <span className={`text-[11px] font-mono ${item.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${item.totalPnL}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Rate by Trading Session */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Win Rate by Market Session</span>
            </h3>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Volume Sessions</span>
          </div>

          <div className="mt-3.5 space-y-3">
            {analytics?.bySession?.map(item => (
              <div key={item.key} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-slate-900 font-medium text-slate-200 border border-slate-800">
                    {item.key} Session
                  </span>
                  <span className="text-slate-400">({item.total} trades)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`font-mono font-bold ${item.winRate >= 70 ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {item.winRate}%
                  </span>
                  <span className={`text-[11px] font-mono ${item.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${item.totalPnL}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Rate by Signal Type (BUY vs SELL) */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>BUY vs SELL Direction Success</span>
            </h3>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Bias Analysis</span>
          </div>

          <div className="mt-3.5 space-y-3">
            {analytics?.bySignalType?.map(item => (
              <div key={item.key} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded font-bold font-mono ${
                    item.key === 'BUY' ? 'badge-profit' : 'badge-loss'
                  }`}>
                    {item.key}
                  </span>
                  <span className="text-slate-400">({item.total} total)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-emerald-400">{item.winRate}%</span>
                  <span className={`text-[11px] font-mono ${item.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${item.totalPnL}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main Trade Scenarios & Status Lifecycle Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        
        {/* Controls & Filter Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Trade Scenario & Status Log History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect full scenario snapshots: signals, market conditions, RSI values, and status transitions
            </p>
          </div>

          {/* Filters & Export */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Asset Filter */}
            <select
              value={selectedSymbol}
              onChange={e => handleFilterUpdate(e.target.value, selectedTimeframe, selectedStatus)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Assets</option>
              <option value="EURUSD">EURUSD</option>
              <option value="GBPUSD">GBPUSD</option>
              <option value="XAUUSD">XAUUSD</option>
              <option value="BTCUSD">BTCUSD</option>
              <option value="US30">US30</option>
            </select>

            {/* Timeframe Filter */}
            <select
              value={selectedTimeframe}
              onChange={e => handleFilterUpdate(selectedSymbol, e.target.value, selectedStatus)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Timeframes</option>
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={e => handleFilterUpdate(selectedSymbol, selectedTimeframe, e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SIGNAL_GENERATED">Signal Generated</option>
              <option value="ORDER_PLACED">Order Placed</option>
              <option value="ORDER_EXECUTED">Order Executed</option>
              <option value="CLOSED_WIN">Closed (Win)</option>
              <option value="CLOSED_LOSS">Closed (Loss)</option>
            </select>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 bg-slate-900/40">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">TF</th>
                <th className="py-3 px-4">Signal</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Entry / Exit</th>
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">RSI Condition</th>
                <th className="py-3 px-4 text-right">PnL ($)</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-xs">
              {scenarios.map(scen => {
                const isWin = scen.status === 'CLOSED_WIN';
                const isLoss = scen.status === 'CLOSED_LOSS';
                const isOpen = ['ORDER_EXECUTED', 'ORDER_PLACED', 'SIGNAL_GENERATED'].includes(scen.status);

                return (
                  <tr key={scen.id} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono whitespace-nowrap">
                      {new Date(scen.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Symbol */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {scen.symbol}
                    </td>

                    {/* Timeframe */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300 font-mono border border-slate-800">
                        {scen.timeframe}
                      </span>
                    </td>

                    {/* Signal Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md font-bold font-mono ${
                        scen.signalType === 'BUY' ? 'badge-profit' : 'badge-loss'
                      }`}>
                        {scen.signalType}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        isWin ? 'badge-profit' : isLoss ? 'badge-loss' : 'badge-info'
                      }`}>
                        {scen.status}
                      </span>
                    </td>

                    {/* Entry / Exit Price */}
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      <span>{scen.price}</span>
                      {scen.exitPrice && (
                        <span className="text-slate-500 mx-1">→ {scen.exitPrice}</span>
                      )}
                    </td>

                    {/* Market Session */}
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {scen.session || 'London'}
                    </td>

                    {/* RSI Value */}
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      <span className={scen.rsi < 35 ? 'text-emerald-400 font-bold' : scen.rsi > 65 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        RSI: {scen.rsi || '14'}
                      </span>
                    </td>

                    {/* PnL */}
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold whitespace-nowrap text-sm">
                      <span className={scen.pnl > 0 ? 'text-emerald-400' : scen.pnl < 0 ? 'text-rose-400' : 'text-slate-400'}>
                        {scen.pnl > 0 ? '+' : ''}${scen.pnl || 0}
                      </span>
                    </td>

                    {/* Inspect Timeline Modal Trigger */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedScenario(scen)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-slate-700 transition-colors"
                        title="View Scenario Status Timeline & Technical Details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Scenario Detail Modal */}
      {selectedScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-400" />
                <span>Scenario Lifecycle & Snapshot Details</span>
              </h3>
              <button 
                onClick={() => setSelectedScenario(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block">Scenario ID</span>
                  <span className="text-slate-200 font-bold">{selectedScenario.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Asset & TF</span>
                  <span className="text-indigo-400 font-bold">{selectedScenario.symbol} ({selectedScenario.timeframe})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Signal Type</span>
                  <span className={selectedScenario.signalType === 'BUY' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {selectedScenario.signalType} ({selectedScenario.lotSize} lots)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total PnL</span>
                  <span className={selectedScenario.pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    ${selectedScenario.pnl || 0}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-300 uppercase tracking-wider mb-1">Scenario Trigger Notes</h4>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 italic">
                  "{selectedScenario.notes || 'Signal triggered based on momentum indicators.'}"
                </p>
              </div>

              {/* Status Timeline */}
              <div>
                <h4 className="font-semibold text-slate-300 uppercase tracking-wider mb-2">Status Timeline</h4>
                <div className="space-y-2 border-l-2 border-indigo-500/30 pl-3">
                  {selectedScenario.statusTimeline?.map((item, idx) => (
                    <div key={idx} className="relative text-slate-300">
                      <span className="font-semibold font-mono text-indigo-300">{item.status}</span>
                      <span className="text-[11px] text-slate-500 ml-2">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedScenario(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
