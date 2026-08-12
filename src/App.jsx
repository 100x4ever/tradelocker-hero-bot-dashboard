import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatCard from './components/StatCard';
import AccountsOverview from './components/AccountsOverview';
import AssetPnLTable from './components/AssetPnLTable';
import AssetConfigModal from './components/AssetConfigModal';
import ScenarioAnalytics from './components/ScenarioAnalytics';
import LiveLogsView from './components/LiveLogsView';
import TradeLockerSettings from './components/TradeLockerSettings';

import { api } from './services/api';
import { DollarSign, Calendar, TrendingUp, Award, Activity, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [scenarioAnalytics, setScenarioAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [positions, setPositions] = useState([]);

  // Asset Config Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    loadAllData();
    // Fast 3-second live refresh interval
    const interval = setInterval(loadAllData, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      const [sData, accData, assData, scenData, analyticsData, logData] = await Promise.all([
        api.getStats(),
        api.getAccounts(),
        api.getAssets(),
        api.getScenarios(),
        api.getScenarioAnalytics(),
        api.getLogs()
      ]);

      setStats(sData);
      setAccounts(accData);
      setAssets(assData);
      setScenarios(scenData);
      setScenarioAnalytics(analyticsData);
      setLogs(logData);
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  };

  const handleToggleBot = async () => {
    try {
      await api.toggleBot();
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMode = async (mode) => {
    try {
      await api.setBotMode(mode);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditAsset = (asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const handleAddNewAsset = () => {
    setSelectedAsset(null);
    setIsModalOpen(true);
  };

  const handleSaveAsset = async (id, formData) => {
    try {
      if (id) {
        await api.updateAsset(id, formData);
      } else {
        await api.addAsset(formData);
      }
      setIsModalOpen(false);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving asset configuration');
    }
  };

  const handleToggleAssetStatus = async (id, enabled) => {
    try {
      await api.updateAsset(id, { enabled });
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleScenarioFilter = async (filters) => {
    try {
      const filtered = await api.getScenarios(filters);
      setScenarios(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        botState={stats?.botState}
        onToggleBot={handleToggleBot}
        onToggleMode={handleToggleMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* Live Refresh Badge */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-slate-200">Live TradeLocker Auto-Sync</span>
            <span className="text-slate-500">• Refreshing every 3 seconds</span>
          </div>
          <button 
            onClick={loadAllData}
            className="p-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3 text-indigo-400" />
            <span>Sync Now</span>
          </button>
        </div>

        {/* KPI Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Daily PnL"
            value={`${stats?.dailyPnL >= 0 ? '+' : ''}$${stats?.dailyPnL?.toFixed(2) || '0.00'}`}
            subtitle="Calculated today across HeroFX accounts"
            icon={DollarSign}
            isPnL={true}
            pnlValue={stats?.dailyPnL || 0}
            badgeText={stats?.dailyPnL >= 0 ? 'Profitable' : 'Drawdown'}
          />

          <StatCard
            title="Weekly PnL"
            value={`${stats?.weeklyPnL >= 0 ? '+' : ''}$${stats?.weeklyPnL?.toFixed(2) || '0.00'}`}
            subtitle="Rolling 7-day cumulative net profit"
            icon={Calendar}
            isPnL={true}
            pnlValue={stats?.weeklyPnL || 0}
            badgeText="7-Day"
          />

          <StatCard
            title="Total Account PnL"
            value={`${stats?.totalPnL >= 0 ? '+' : ''}$${stats?.totalPnL?.toFixed(2) || '0.00'}`}
            subtitle={`Balance: $${stats?.totalBalance?.toLocaleString() || '0'}`}
            icon={TrendingUp}
            isPnL={true}
            pnlValue={stats?.totalPnL || 0}
            badgeText="All-Time"
          />

          <StatCard
            title="Bot Win Rate (Success Rate)"
            value={`${stats?.overallWinRate || 0}%`}
            subtitle={`${stats?.totalScenariosLogged || 0} trade scenarios evaluated`}
            icon={Award}
            badgeText={`${stats?.activeAssetsCount || 0} Scanned Pairs`}
          />
        </div>

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <AccountsOverview accounts={accounts} />
            <AssetPnLTable
              assets={assets}
              onEditAsset={handleEditAsset}
              onAddNewAsset={handleAddNewAsset}
              onToggleAssetStatus={handleToggleAssetStatus}
            />
          </div>
        )}

        {activeTab === 'assets' && (
          <AssetPnLTable
            assets={assets}
            onEditAsset={handleEditAsset}
            onAddNewAsset={handleAddNewAsset}
            onToggleAssetStatus={handleToggleAssetStatus}
          />
        )}

        {activeTab === 'scenarios' && (
          <ScenarioAnalytics
            scenarios={scenarios}
            analytics={scenarioAnalytics}
            onFilterChange={handleScenarioFilter}
          />
        )}

        {activeTab === 'logs' && (
          <LiveLogsView logs={logs} onRefresh={loadAllData} />
        )}

        {activeTab === 'settings' && (
          <TradeLockerSettings />
        )}

      </main>

      {/* Asset Config Modal */}
      <AssetConfigModal
        asset={selectedAsset}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAsset}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TradeLocker & HeroFX Trading Bot App • Railway & GitHub Ready</span>
          <span className="font-mono text-[11px] text-indigo-400/70">
            3-Sec Live Stream Active
          </span>
        </div>
      </footer>

    </div>
  );
}
