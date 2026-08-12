import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, isPnL = false, pnlValue = 0, badgeText }) {
  const isPositive = pnlValue >= 0;

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden group">
      {/* Background Subtle Gradient Glow */}
      <div 
        className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-all group-hover:opacity-40 ${
          isPnL ? (isPositive ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-indigo-500'
        }`}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className={`text-2xl font-extrabold mt-1 font-mono-num ${
            isPnL ? (isPositive ? 'text-emerald-400' : 'text-rose-400') : 'text-white'
          }`}>
            {value}
          </h3>
        </div>
        
        {Icon && (
          <div className={`p-2.5 rounded-xl ${
            isPnL 
              ? (isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20')
              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-400">{subtitle}</span>
        {badgeText && (
          <span className={`px-2 py-0.5 rounded-full font-medium ${
            isPnL 
              ? (isPositive ? 'badge-profit' : 'badge-loss')
              : 'badge-info'
          }`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
