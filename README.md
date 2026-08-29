# TradeTwin

**TradeTwin** is a behavioural trading twin built for **Monad Testnet**. It reads your real on-chain wallet activity, builds a Trading DNA profile, creates an AI twin that mimics your decision patterns, and lets you compete against it in a risk-free historical market simulation. Results and achievements can be recorded permanently on-chain via the `TradeTwinRegistry` smart contract.

> **No mock trade data.** Wallet transfers come from Monad Atlas + Monad RPC. Prices come from CoinGecko (with your API key). Blockchain writes go to Monad Testnet via MetaMask.

---

## Table of Contents

- [Features](#features)
- [What Is Real vs Simulated](#what-is-real-vs-simulated)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [CoinGecko API Setup & Verification](#coingecko-api-setup--verification)
- [Monad Testnet & Wallet Setup](#monad-testnet--wallet-setup)
- [Registered Wallet](#registered-wallet)
- [Full Application Flow](#full-application-flow)
- [On-Chain Contract](#on-chain-contract)
- [API Routes](#api-routes)
- [Data Sources](#data-sources)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Production Build](#production-build)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Tech Stack](#tech-stack)

---

## Features

- **Real wallet connection** via MetaMask on Monad Testnet (Wagmi v3 + Viem)
- **On-chain transfer ingestion** from Monad Atlas API and Monad RPC block scan
- **Behavioural analysis** — win rate, trade frequency, risk patterns from real transfers
- **Trading DNA** — 5 scored behavioural dimensions with confidence metrics
- **Trading Twin** — probabilistic model of your buy/hold/sell decisions
- **5-round simulation** — historical ETH/USD replay using live CoinGecko price data ($10,000 virtual portfolio)
- **On-chain proofs** — register twin, record simulation results, mint beat-twin achievement on `TradeTwinRegistry`
- **What-If analysis** — counterfactual breakdown after each simulation

---

## What Is Real vs Simulated

| Component | Source | Mock? |
|-----------|--------|-------|
| Wallet connection | MetaMask → Monad Testnet | No |
| Transfer history | [Monad Atlas](https://monadatlas.com) + `https://testnet-rpc.monad.xyz/` | No |
| ETH/USD prices | CoinGecko API (your `COINGECKO_API_KEY`) | No |
| Trading DNA & Twin | Computed from your real transfers | No |
| Simulation portfolio | Virtual $10,000 — no real funds | Simulated (by design) |
| Simulation market rounds | Real historical prices from CoinGecko | No |
| Registry transactions | `TradeTwinRegistry` on Monad Testnet | No |

**Removed:** All demo/mock trade datasets. If your wallet has zero on-chain transfers, analysis completes with empty history and prompts you to make testnet MON transfers.

**Prices:** Live CoinGecko only. A valid `COINGECKO_API_KEY` is required; responses are cached in `data/coingecko-eth-usd.json` (gitignored) when the API is reachable.

**Transfers:** Fetched in parallel from Monad Atlas, Monad RPC block scan, and optionally Monadscan (if `MONADSCAN_API_KEY` is set).

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| **Node.js** | 18 or newer |
| **npm** | Comes with Node.js |
| **MetaMask** | [metamask.io](https://metamask.io/download/) |
| **Monad Testnet** | Chain ID `10143`, RPC `https://testnet-rpc.monad.xyz/` |
| **Testnet MON** | [Monad faucet](https://faucet.monad.xyz/) for gas |
| **CoinGecko API key** | Free demo or Pro key from [coingecko.com](https://www.coingecko.com/en/api) |

---

## Quick Start

```bash
cd tradetwin
npm install
cp .env.example .env
# Edit .env — add your COINGECKO_API_KEY (see below)
npm run dev
```

Open **http://localhost:3000**

1. Connect MetaMask on **Monad Testnet**
2. Select the **registered wallet** (see [Registered Wallet](#registered-wallet))
3. On **Dashboard** → deploy the registry contract (one-time)
4. **Analyze My Trading** → view DNA → Twin → Simulation → Results
5. On **Results**, record simulation and achievement on-chain

---

## Environment Variables

Create a `.env` file in the project root (never commit it — already in `.gitignore`):

```env
# Required for live ETH/USD prices (server-side only)
COINGECKO_API_KEY=your_key_here

# Use "false" for CoinGecko Demo API keys (x-cg-demo-api-key header)
# Omit or set "true" for Pro API keys (x-cg-pro-api-key header)
COINGECKO_USE_PRO_API=false

# Optional — set after deploying the registry (see On-Chain Contract)
# NEXT_PUBLIC_REGISTRY_ADDRESS=0xYourRegistryAddress

# Optional — only for CLI deploy via Hardhat (never commit)
# DEPLOYER_PRIVATE_KEY=0x...
```

| Variable | Required | Description |
|----------|----------|-------------|
| `COINGECKO_API_KEY` | **Required** | Live ETH/USD prices for simulation and trade enrichment |
| `COINGECKO_USE_PRO_API` | No | `false` = demo API host; anything else = Pro API host |
| `MONADSCAN_API_KEY` | **Strongly recommended** | Full wallet tx history via [Etherscan API V2](https://docs.etherscan.io/v2-migration) (`chainid=10143`). Without it, only a recent RPC window is scanned. |
| `NEXT_PUBLIC_REGISTRY_ADDRESS` | No | Pre-set registry address so users skip in-app deploy |
| `DEPLOYER_PRIVATE_KEY` | No | Only for `npm run deploy:registry` from CLI |

---

## CoinGecko API Setup & Verification

### Setup

1. Sign up at [CoinGecko API](https://www.coingecko.com/en/api)
2. Copy your API key into `.env` as `COINGECKO_API_KEY`
3. For **Demo API keys**, set:
   ```env
   COINGECKO_USE_PRO_API=false
   ```
4. For **Pro API keys**, set:
   ```env
   COINGECKO_USE_PRO_API=true
   ```
   or remove the line (Pro is the default when a key is present)

### Verify the key works

Run this from the project root (reads your `.env`):

```bash
node -e "
const fs=require('fs');
const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i),l.slice(i+1)]}));
const key=env.COINGECKO_API_KEY?.trim();
const usePro=env.COINGECKO_USE_PRO_API!=='false';
const base=usePro?'https://pro-api.coingecko.com/api/v3':'https://api.coingecko.com/api/v3';
const headers=usePro?{'x-cg-pro-api-key':key}:{'x-cg-demo-api-key':key};
fetch(base+'/coins/ethereum/market_chart?vs_currency=usd&days=7&interval=daily',{headers})
  .then(r=>r.json()).then(j=>console.log('OK —',j.prices?.length,'price points, latest USD:',j.prices?.at(-1)?.[1]))
  .catch(e=>console.error('FAILED',e));
"
```

Expected output:
```
OK — 8 price points, latest USD: 2436.12
```

### Verify inside the running app

After `npm run dev`, open:

```
http://localhost:3000/api/prices/simulation
```

Check the JSON response:

```json
{
  "rounds": [ ... ],
  "meta": {
    "priceSource": "coingecko",
    "fromCache": true
  }
}
```

- `"priceSource": "coingecko"` → live or cached CoinGecko data
- If this endpoint returns `503`, check `COINGECKO_API_KEY` in `.env` and restart `npm run dev`

Price cache is stored at `data/coingecko-eth-usd.json` (gitignored).

---

## Monad Testnet & Wallet Setup

Add **Monad Testnet** to MetaMask:

| Field | Value |
|-------|-------|
| Network name | Monad Testnet |
| RPC URL | `https://testnet-rpc.monad.xyz/` |
| Chain ID | `10143` |
| Currency symbol | MON |
| Block explorer | `https://testnet.monadexplorer.com` |

Get testnet MON from the [Monad faucet](https://faucet.monad.xyz/) before deploying contracts or submitting transactions.

---

## Registered Wallet

TradeTwin is configured for this wallet address:

```
0x9c7EC5B79c27Be88ABB98815246A48E125c6675c
```

Import this account in MetaMask and select it when connecting. The app checks:

- Wallet is connected
- Network is Monad Testnet (10143)
- Active account matches the registered address

To use a different wallet, change `EXPECTED_WALLET` in `src/config/wallet.ts`.

---

## Full Application Flow

```
Landing (/)
  └─ Connect MetaMask → Monad Testnet → registered wallet
       └─ Dashboard (/dashboard)
            ├─ Deploy TradeTwinRegistry (one-time, needs MON gas)
            └─ Analyze My Trading
                 └─ DNA (/dna) — behavioural scores
                      └─ Twin (/twin)
                           ├─ Register Twin On-Chain (registerTwin)
                           └─ Beat My Twin → Simulation (/simulation)
                                └─ 5 rounds: BUY / HOLD / SELL
                                     └─ Results (/results)
                                          ├─ Record Simulation On-Chain
                                          └─ Record Achievement (if you won)
```

### Step-by-step

| Step | Page | What happens |
|------|------|--------------|
| 1 | `/` | Connect wallet; auto-prompt to switch network/account |
| 2 | `/dashboard` | View MON balance, tx count; deploy registry if not set |
| 3 | `/dashboard` | **Analyze** → `POST /api/analyze` fetches Atlas + RPC transfers |
| 4 | `/dna` | View 5 DNA dimension scores and confidence |
| 5 | `/twin` | Review twin probabilities; **Register Twin On-Chain** |
| 6 | `/simulation` | Play 5 rounds against historical ETH/USD candles |
| 7 | `/results` | Compare returns; record on-chain proof; What-If panel |

**Note:** Wallet disconnects on every page reload by design (`WalletSessionProvider`). Click **Connect** again to continue.

---

## On-Chain Contract

### `TradeTwinRegistry.sol`

Deployed to **Monad Testnet**. Stores:

| Function | Purpose |
|----------|---------|
| `registerTwin(bytes32 twinHash, uint256 tradeCount)` | Cryptographic proof of your behavioural twin |
| `recordSimulation(int32 userBps, int32 twinBps, uint8 winner, uint8 rounds)` | Log simulation returns and winner |
| `recordAchievement(bytes32 achievementId)` | One-time beat-twin achievement per wallet |
| `getSimulationCount(address)` | Read how many simulations you recorded |
| `hasAchievement(address, bytes32)` | Check if achievement exists |
| `twins(address)` | Read twin registration status |

### Deploy the registry

**Option A — In the app (recommended)**

1. Go to `/dashboard`
2. Click **Deploy Registry Contract**
3. Confirm in MetaMask
4. Address is saved to `localStorage` (`tradetwin:registry-address`)

**Option B — CLI**

```bash
# Add DEPLOYER_PRIVATE_KEY to .env
npm run compile:contracts
npm run deploy:registry
```

Writes address to `src/config/deployed-registry.json`. Optionally set:

```env
NEXT_PUBLIC_REGISTRY_ADDRESS=0xYourDeployedAddress
```

### Verify on Monad Explorer

1. Open your registry address on [testnet.monadexplorer.com](https://testnet.monadexplorer.com)
2. After recording, look for `SimulationRecorded` and `AchievementRecorded` events
3. Transaction links appear in the app after confirmation

### Transaction safety

Before every write, the app:

1. Verifies registry contract bytecode exists on-chain
2. Simulates the call (`simulateContract`) to catch reverts
3. Submits with explicit `chainId: 10143`
4. Waits for confirmed receipt before showing success

---

## API Routes

### `POST /api/analyze`

Analyzes a wallet address using real on-chain data.

**Request:**
```json
{ "address": "0x9c7EC5B79c27Be88ABB98815246A48E125c6675c" }
```

**Response (abbreviated):**
```json
{
  "profile": { "tradeCount": 12, "winRate": { ... }, ... },
  "dna": { "scores": { ... }, "overallConfidence": 0.72 },
  "twin": { "name": "...", "baselineProbabilities": { ... } },
  "trades": [ ... ],
  "meta": {
    "transferCount": 12,
    "source": "monad-atlas+monad-rpc",
    "priceSource": "coingecko",
    "hasOnChainHistory": true,
    "monBalance": 1.5,
    "address": "0x..."
  }
}
```

**Data pipeline:**
1. Fetch transfers from Monad Atlas (`monadatlas.com/api/address_transfers`)
2. Merge with RPC scan (last 25,000 blocks on `testnet-rpc.monad.xyz`)
3. Enrich with CoinGecko ETH/USD prices at each transfer timestamp
4. Run behavioural engine → DNA → Twin profile

### `GET /api/prices/simulation`

Returns 5 historical market rounds for the simulation engine, built from CoinGecko daily prices.

---

## Data Sources

| Data | Endpoint / Source |
|------|-------------------|
| Transfers (primary) | `https://monadatlas.com/api/address_transfers` |
| Transfers (fallback) | `https://testnet-rpc.monad.xyz/` (block scan) |
| ETH/USD prices | CoinGecko `coins/ethereum/market_chart` |
| Wallet balance | Monad RPC `eth_getBalance` |
| Contract reads/writes | Monad Testnet via Wagmi |
| Block explorer | `https://testnet.monadexplorer.com` |

---

## Project Structure

```
tradetwin/
├── contracts/
│   └── TradeTwinRegistry.sol      # On-chain registry
├── scripts/
│   └── deploy-registry.ts         # Hardhat deploy script
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── page.tsx               # Landing
│   │   ├── dashboard/
│   │   ├── dna/
│   │   ├── twin/
│   │   ├── simulation/
│   │   ├── results/
│   │   └── api/
│   │       ├── analyze/           # Wallet analysis API
│   │       └── prices/simulation/ # Market rounds API
│   ├── components/
│   │   ├── onchain/               # DeployRegistryCard, OnChainProofPanel
│   │   ├── wallet/                # Connect, network switch prompts
│   │   └── ...
│   ├── config/
│   │   ├── wagmi.ts               # Monad Testnet + MetaMask
│   │   ├── wallet.ts              # Registered wallet address
│   │   └── registry.ts            # Registry address resolution
│   ├── context/
│   │   ├── AnalysisContext.tsx    # Analysis state
│   │   ├── RegistryContext.tsx    # On-chain tx state
│   │   └── SimulationContext.tsx  # Simulation session
│   └── lib/
│       ├── trades/                # Atlas + RPC fetchers
│       ├── prices/                # CoinGecko service
│       ├── analysis/              # Behaviour engine
│       ├── dna/                   # DNA scoring
│       ├── twin/                  # Twin model
│       ├── simulation/            # 5-round replay engine
│       └── contracts/             # ABI, hashing, read helpers
├── .env.example
├── hardhat.config.ts
└── package.json
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `localhost:3000` |
| `npm run build` | Production build (TypeScript check + static generation) |
| `npm start` | Run production server |
| `npm run lint` | ESLint |
| `npm run compile:contracts` | Compile Solidity via Hardhat |
| `npm run deploy:registry` | Deploy registry to Monad Testnet via CLI |

---

## Production Build

```bash
npm run build
npm start
```

Set environment variables on your host (Vercel, Railway, etc.):

- `COINGECKO_API_KEY` (required for live prices)
- `COINGECKO_USE_PRO_API` (optional)
- `NEXT_PUBLIC_REGISTRY_ADDRESS` (optional, shared registry)

---

## Troubleshooting

### CoinGecko / prices

| Symptom | Fix |
|---------|-----|
| `503` from `/api/prices/simulation` | Check `COINGECKO_API_KEY` in `.env`; restart `npm run dev` |
| Demo key returns 401 | Set `COINGECKO_USE_PRO_API=false` |
| Pro key returns 401 | Set `COINGECKO_USE_PRO_API=true` or remove the line |
| Stale prices | Delete `data/coingecko-eth-usd.json` and reload |

### Wallet

| Symptom | Fix |
|---------|-----|
| "Wrong network" | Switch MetaMask to Monad Testnet (10143) |
| "Account mismatch" | Select `0x9c7E…675c` in MetaMask |
| Disconnected after reload | Reconnect — intentional session reset |
| Transaction rejected | Ensure you have testnet MON for gas |

### Analysis

| Symptom | Fix |
|---------|-----|
| 0 transfers found | Send a few MON transfers on Monad Testnet, then re-analyze |
| Analysis slow | RPC scans up to 25,000 blocks; Atlas is tried first |

### On-chain

| Symptom | Fix |
|---------|-----|
| On-chain buttons hidden | Deploy registry from Dashboard first |
| "Registry has no contract code" | Redeploy — old address may be invalid |
| Achievement already recorded | Contract allows one beat-twin achievement per wallet (expected) |
| Simulation button greyed out | Confirm in MetaMask; check network and MON balance |

### Build

```bash
npm run build
```

Must complete with no TypeScript errors before deploying.

---

## Security

- **Never commit `.env`** — contains your CoinGecko API key
- `COINGECKO_API_KEY` is **server-side only** (`import "server-only"` in price service)
- No private keys in frontend code
- `DEPLOYER_PRIVATE_KEY` is only for CLI Hardhat deploy
- Registry transactions require MetaMask user approval

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Wallet | Wagmi v3, Viem, MetaMask |
| Chain | Monad Testnet (10143) |
| Contracts | Solidity 0.8.24, Hardhat |
| Prices | CoinGecko API |
| On-chain data | Monad Atlas, Monad RPC |
| Animation | Framer Motion |

---

## License

MIT — see `contracts/TradeTwinRegistry.sol` SPDX header.
