import React from 'react';
import { Activity, Play, Pause, ShieldCheck, Zap, Server } from 'lucide-react';

export default function Header({ 
  botState, 
  onToggleBot, 
  onToggleMode, 
  activeTab, 
  setActiveTab,
  stats 
}) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Status */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-white tracking-tight">HeroFX TradeLocker</h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-800 text-indigo-400 border border-slate-700">
                  Bot Engine v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block w-2 h-2 rounded-full ${botState?.isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                <span>{botState?.isRunning ? 'Scanner Active & Monitoring' : 'Scanner Paused'}</span>
              </p>
            </div>
          </div>

          {/* Mode Switcher Badge */}
          <button
            onClick={() => onToggleMode(botState?.mode === 'Simulation' ? 'Live' : 'Simulation')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              botState?.mode === 'Live'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{botState?.mode === 'Live' ? 'LIVE TRADE EXECUTION' : 'SIMULATION MODE'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          {[
            { id: 'dashboard', label: 'Dashboard & Accounts' },
            { id: 'assets', label: 'Assets & Bot Scanner' },
            { id: 'scenarios', label: 'Scenario & Signal Analytics' },
            { id: 'logs', label: 'Live Scanner Logs' },
            { id: 'settings', label: 'TradeLocker API' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Master Bot Toggle Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleBot}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-lg ${
              botState?.isRunning
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
            }`}
          >
            {botState?.isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>PAUSE BOT ENGINE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>START BOT SCANNER</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
