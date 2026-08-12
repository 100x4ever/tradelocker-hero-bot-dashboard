import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AccountsOverview from './components/AccountsOverview';
import AssetPnLTable from './components/AssetPnLTable';
import AssetConfigModal from './components/AssetConfigModal';
import ScenarioAnalytics from './components/ScenarioAnalytics';
import SnapshotLogsView from './components/SnapshotLogsView';
import LiveLogsView from './components/LiveLogsView';
import TradeLockerSettings from './components/TradeLockerSettings';

import { api } from './services/api';
import { RefreshCw } from 'lucide-react';

const defaultStats = {
  totalBalance: 999.75,
  totalEquity: 1000.54,
  dailyPnL: 0.79,
  weeklyPnL: 0.79,
  totalPnL: 0.79,
  overallWinRate: 80.0,
  totalScenariosLogged: 5,
  activeAssetsCount: 3,
  accountsCount: 1,
  botState: { isRunning: true, mode: 'Live' }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(defaultStats);
  const [accounts, setAccounts] = useState([]);
  const [positions, setPositions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [scenarioAnalytics, setScenarioAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);

  // Asset Config Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      const results = await Promise.allSettled([
        api.getStats(),
        api.getAccounts(),
        api.getPositions(),
        api.getAssets(),
        api.getScenarios(),
        api.getScenarioAnalytics(),
        api.getLogs()
      ]);

      if (results[0].status === 'fulfilled' && results[0].value) {
        setStats(results[0].value);
      }
      if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) {
        setAccounts(results[1].value);
      }
      if (results[2].status === 'fulfilled' && Array.isArray(results[2].value)) {
        setPositions(results[2].value);
      }
      if (results[3].status === 'fulfilled' && Array.isArray(results[3].value)) {
        setAssets(results[3].value);
      }
      if (results[4].status === 'fulfilled' && Array.isArray(results[4].value)) {
        setScenarios(results[4].value);
      }
      if (results[5].status === 'fulfilled' && results[5].value) {
        setScenarioAnalytics(results[5].value);
      }
      if (results[6].status === 'fulfilled' && Array.isArray(results[6].value)) {
        setLogs(results[6].value);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  };

  const handleToggleBot = async () => {
    try {
      const res = await api.toggleBot();
      setStats(prev => ({
        ...prev,
        botState: { ...(prev?.botState || {}), isRunning: res.isRunning }
      }));
      loadAllData();
    } catch (err) {
      console.error('Toggle bot error:', err);
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

  const currentStats = stats || defaultStats;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        botState={currentStats.botState}
        onToggleBot={handleToggleBot}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={currentStats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* Live Refresh Badge */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-slate-200">Live TradeLocker Auto-Sync</span>
            <span className="text-slate-500">• Refreshing every 6 seconds (HeroFX Live Account #812189)</span>
          </div>
          <button 
            onClick={loadAllData}
            className="p-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3 text-indigo-400" />
            <span>Sync Now</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <AccountsOverview assets={assets} positions={positions} onEditAsset={handleEditAsset} />
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

        {activeTab === 'snapshots' && (
          <SnapshotLogsView />
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
            5m Base Stream / Mid Price Limits
          </span>
        </div>
      </footer>

    </div>
  );
}
