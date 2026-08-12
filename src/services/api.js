import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Global Stats
  async getStats() {
    const res = await axios.get(`${API_BASE}/stats`);
    return res.data;
  },

  // Accounts
  async getAccounts() {
    const res = await axios.get(`${API_BASE}/accounts`);
    return res.data;
  },

  // Assets Scanner Config
  async getAssets() {
    const res = await axios.get(`${API_BASE}/assets`);
    return res.data;
  },

  async updateAsset(id, data) {
    const res = await axios.put(`${API_BASE}/assets/${id}`, data);
    return res.data;
  },

  async addAsset(data) {
    const res = await axios.post(`${API_BASE}/assets`, data);
    return res.data;
  },

  // Scenarios & Signal Analytics
  async getScenarios(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const res = await axios.get(`${API_BASE}/scenarios?${query}`);
    return res.data;
  },

  async getScenarioAnalytics() {
    const res = await axios.get(`${API_BASE}/scenarios/analytics`);
    return res.data;
  },

  async updateScenarioStatus(id, data) {
    const res = await axios.put(`${API_BASE}/scenarios/${id}/status`, data);
    return res.data;
  },

  // Bot Control
  async toggleBot() {
    const res = await axios.post(`${API_BASE}/bot/toggle`);
    return res.data;
  },

  async setBotMode(mode) {
    const res = await axios.post(`${API_BASE}/bot/mode`, { mode });
    return res.data;
  },

  // Logs
  async getLogs() {
    const res = await axios.get(`${API_BASE}/logs`);
    return res.data;
  },

  // TradeLocker Credentials & Auth
  async getTradeLockerStatus() {
    const res = await axios.get(`${API_BASE}/tradelocker/status`);
    return res.data;
  },

  async authenticateTradeLocker(credentials) {
    const res = await axios.post(`${API_BASE}/tradelocker/auth`, credentials);
    return res.data;
  }
};
