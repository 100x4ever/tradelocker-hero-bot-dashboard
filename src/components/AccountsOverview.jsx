import React from 'react';
import { Server, ShieldCheck, DollarSign, TrendingUp, Award, Activity } from 'lucide-react';

export default function AccountsOverview({ accounts }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <span>Connected Trading Accounts (HeroFX & TradeLocker)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor daily, weekly, total PnL performance and success rates per account
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map(acc => {
          const isDailyProfitable = acc.dailyPnL >= 0;
          const isWeeklyProfitable = acc.weeklyPnL >= 0;
          const isTotalProfitable = acc.totalPnL >= 0;

          return (
            <div key={acc.id} className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 space-y-5">
              
              {/* Card Top Banner */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-base">{acc.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      acc.type === 'Live' ? 'badge-profit' : 'badge-warn'
                    }`}>
                      {acc.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Account #: <span className="text-slate-200">{acc.accNumber}</span> • Broker: <span className="text-indigo-300">{acc.broker}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Balance</span>
                  <span className="text-lg font-mono font-extrabold text-white">
                    ${acc.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Equity & Margin row */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Account Equity</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    ${acc.equity?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Success Rate (Win Rate)</span>
                  <span className="text-indigo-400 font-bold text-sm flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    {acc.winRate}% ({acc.totalTrades} trades)
                  </span>
                </div>
              </div>

              {/* Daily, Weekly, Total PnL Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                
                {/* Daily PnL */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block">Daily PnL</span>
                  <span className={`font-mono font-extrabold text-sm mt-1 block ${
                    isDailyProfitable ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isDailyProfitable ? '+' : ''}${acc.dailyPnL?.toFixed(2)}
                  </span>
                </div>

                {/* Weekly PnL */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block">Weekly PnL</span>
                  <span className={`font-mono font-extrabold text-sm mt-1 block ${
                    isWeeklyProfitable ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isWeeklyProfitable ? '+' : ''}${acc.weeklyPnL?.toFixed(2)}
                  </span>
                </div>

                {/* Total PnL */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block">Total PnL</span>
                  <span className={`font-mono font-extrabold text-sm mt-1 block ${
                    isTotalProfitable ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isTotalProfitable ? '+' : ''}${acc.totalPnL?.toFixed(2)}
                  </span>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
