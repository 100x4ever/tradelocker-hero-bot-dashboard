# 🚀 HeroFX & TradeLocker Trading Bot & Portfolio Analytics Dashboard

A full-stack Node.js + Express backend & React + Vite dashboard for managing, monitoring, and configuring automated trading bot strategies on **TradeLocker** (HeroFX).

---

## 🌟 Key Application Features

1. **Asset Scanner & Lot Size Manager**:
   - View and edit scan timeframes per asset (`1m`, `5m`, `15m`, `1h`, `4h`, `1d`).
   - Configure custom lot sizes per asset (e.g. `0.01` to `50.0` lots).
   - Track total asset PnL ($), win/loss trade count, and individual asset win rate %.

2. **Account Analytics**:
   - Real-time tracking of **Daily PnL**, **Weekly PnL**, **Total PnL**, and **Success Rate (Win Rate %)**.
   - Multi-account overview for HeroFX Live & Demo accounts.

3. **Trade Signal & Scenario Lifecycle Logging**:
   - Logs every signal generated with market scenario conditions snapshot (`Asset`, `Timeframe`, `RSI`, `EMA`, `Session`, `SL/TP`).
   - Status transition timeline: `SIGNAL_GENERATED` → `ORDER_PLACED` → `ORDER_EXECUTED` → `CLOSED_WIN` / `CLOSED_LOSS`.
   - Analytics breakdown comparing win rates across timeframes, market sessions (London, NY, Asian), and signal direction (BUY vs SELL).
   - Export scenario logs to CSV.

4. **TradeLocker (HeroFX) Integration**:
   - Official JWT Auth flow (`/auth/jwt/token`).
   - Simulation mode switch for safe strategy testing before live execution.

---

## 📦 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 🚀 How to Deploy on Railway & GitHub

### Step 1: Push Code to GitHub
1. Initialize git in project directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of TradeLocker bot & logging app"
   ```
2. Create a new repository on GitHub.
3. Push to your GitHub repo:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Railway
1. Go to [Railway.app](https://railway.app/) and sign in.
2. Click **"New Project"** → Select **"Deploy from GitHub repo"**.
3. Choose your repository from the list.
4. Add Environment Variables in Railway Dashboard (**Variables** tab):
   - `PORT`: `5000`
   - `TRADELOCKER_EMAIL`: Your HeroFX/TradeLocker email
   - `TRADELOCKER_PASSWORD`: Your HeroFX password
   - `TRADELOCKER_SERVER`: `https://demo.tradelocker.com/api/v2` (or `https://live.tradelocker.com/api/v2`)
5. Railway will automatically detect Node.js, run `npm run build`, and start the app using `npm start` / `Procfile`.
6. Click **Generate Domain** under Settings to get your public HTTPS URL!
