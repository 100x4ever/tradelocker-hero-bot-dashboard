import React from 'react';
import { Terminal, RefreshCw, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

export default function LiveLogsView({ logs, onRefresh }) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">Bot Engine Real-Time Scanner Stream</h3>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-colors text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 font-mono text-xs max-h-[500px] overflow-y-auto space-y-2">
        {logs.map((log, idx) => {
          let badgeClass = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
          if (log.level === 'WARN') badgeClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
          if (log.level === 'SIGNAL') badgeClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          if (log.level === 'EXECUTION') badgeClass = 'text-teal-300 bg-teal-500/10 border-teal-500/20';

          return (
            <div key={log.id || idx} className="flex items-start space-x-3 py-1 border-b border-slate-900/60 last:border-0">
              <span className="text-slate-500 shrink-0">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${badgeClass}`}>
                {log.level}
              </span>
              <div className="space-y-0.5">
                <p className="text-slate-200">{log.message}</p>
                {log.details && (
                  <p className="text-[11px] text-slate-500">{log.details}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
