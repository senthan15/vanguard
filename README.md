# 🏦 Vanguard — DeFi Invoice Financing for SMEs

> *Turning unpaid invoices into instant liquidity through Real-World Asset NFTs and tiered DeFi liquidity pools.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Contracts-Solidity-363636)](https://soliditylang.org/)
[![SDG 8](https://img.shields.io/badge/UN%20SDG-Goal%208-brightgreen)](https://sdgs.un.org/goals/goal8)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution & Practical Impact](#-solution--practical-impact)
- [Core Features & Architecture](#-core-features--architecture)
- [What Makes Vanguard Unique](#-what-makes-vanguard-unique)
- [Project Setup](#-project-setup)

---

## 🚨 Problem Statement

### The $5.7 Trillion Funding Gap Killing Small Businesses

Small and Medium Enterprises (SMEs) are the backbone of the global economy — they employ **70% of the world's workforce** and are responsible for the majority of economic activity in emerging markets. Yet they are systematically starved of the capital they need to grow.

**Here's the core paradox:**

Imagine a packaging company that just fulfilled a ₹2 crore ($240,000) order for Walmart. Walmart will pay in **90 days** — a standard industry practice called "net-90 payment terms." But the packaging company needs to pay its workers *today*, restock raw materials *today*, and bid on the next contract *today*.

They go to a traditional bank for a working capital loan. The bank says: *"Show us collateral — land, buildings, equipment."* The packaging company has none of that. Their most valuable asset — the legally binding, signed invoice from Walmart — is invisible to the bank's credit model.

This is not an edge case. This is the daily reality for **hundreds of millions of SMEs globally**, creating a funding gap the World Bank estimates at **$5.7 trillion**.

**The problem breaks down into three layers:**

| Layer | The Reality |
|---|---|
| **Access** | Traditional banks require physical collateral; most SMEs own none |
| **Speed** | Even when loans are approved, they take weeks — too slow for working capital needs |
| **Geography** | SMEs in emerging markets (India, Southeast Asia, Africa) are almost entirely excluded from formal credit |

The result: businesses with *real, verified revenue* are forced to take predatory loans at 3–5% monthly interest, stunting growth or collapsing entirely.

---

## 💡 Solution & Practical Impact

### Vanguard: A DeFi Credit Market Backed by Real-World Trade

Vanguard transforms the problem entirely by asking a different question: **What if an invoice from a reputable buyer (Walmart, Tata, Amazon) could itself become collateral?**

Using blockchain and DeFi infrastructure, Vanguard creates a three-sided marketplace:

```
SME with Invoice  →  [Vanguard Protocol]  →  Global DeFi Investors
(Needs cash now)       (Verify, Tokenize,     (Earn real yield from
                         Pool, Settle)          real commerce)
```

**The core workflow in plain English:**

1. **Upload** — An SME connects their accounting software (QuickBooks, SAP, Zoho) and uploads a verified invoice.
2. **Mint** — Vanguard's protocol verifies the invoice's authenticity and mints it as a unique **RWA-NFT** (Real-World Asset NFT) — a digital token that legally represents the debt claim.
3. **Sell** — The SME sells this NFT to Vanguard's liquidity pool and receives **immediate stablecoin payment** (e.g., 90% of invoice value, same day).
4. **Earn** — Global investors who fund the pool collect the remaining 10% + interest when the buyer (Walmart, etc.) pays the invoice at maturity.
5. **Settle** — Chainlink Oracles monitor payment events in real-time. When payment is detected, the NFT is automatically settled and marked as redeemed.

### Practical Impact

| Stakeholder | Before Vanguard | After Vanguard |
|---|---|---|
| **SME Owner** | Waits 90 days or takes predatory loan at 36%+ APR | Receives 90% of invoice value in hours |
| **DeFi Investor** | Earns yield only from volatile crypto assets | Earns stable, real-world-backed yield (8–20% APY) |
| **Global Economy** | $5.7T locked in unpaid invoices | Capital flows to where it's needed most |

**UN SDG Alignment:** This project directly addresses **UN Sustainable Development Goal 8 — Decent Work and Economic Growth** by unlocking capital for the underserved SME sector that employs 70% of the global workforce.

---

## 🔧 Core Features & Architecture

### Feature 1: Invoice-to-NFT Minting Engine

A secure dashboard where SMEs connect their accounting integrations (QuickBooks, SAP, Zoho Books) and upload digital invoices. The system:

- Parses invoice metadata (buyer identity, invoice amount, due date, payment terms)
- Runs a verification pipeline against business registry APIs
- Mints a unique **ERC-721 NFT** on-chain, where the token's metadata encodes the full legal debt claim
- Stores the original invoice document on **IPFS** (decentralized, tamper-proof storage), with the IPFS hash anchored on-chain

Each NFT is a legally traceable, on-chain representation of an off-chain payment obligation.

---

### Feature 2: Dual-Tranche Liquidity Pools

Vanguard solves the "liquidity chicken-and-egg" problem — you need investors to attract SMEs, and SMEs to attract investors — through a **structured finance** model borrowed from traditional banking (CDOs, CLOs) but made transparent and on-chain.

```
┌──────────────────────────────────────────────┐
│              VANGUARD LIQUIDITY POOL         │
├──────────────────────┬───────────────────────┤
│     SENIOR TRANCHE   │    JUNIOR TRANCHE     │
│                      │                       │
│  • Lower APY (8-12%) │  • Higher APY (18-25% │
│  • First to be paid  │  • First to absorb    │
│  • Institutional-    │    losses (first-loss │
│    grade safety      │    position)          │
│  • Priority claim    │  • Attracts DeFi      │
│    on pool assets    │    yield-seekers      │
└──────────────────────┴───────────────────────┘
```

**Why this works:** Conservative institutional investors take the Senior Tranche (safe, stable). Risk-tolerant DeFi investors take the Junior Tranche (high yield). This single design unlocks two completely different investor bases simultaneously, ensuring the pool is always liquid.

---

### Feature 3: ZK-KYB (Zero-Knowledge Know Your Business)

Privacy is a major barrier in traditional finance — SMEs don't want their revenue figures, client relationships, and financial health exposed on a public blockchain.

Vanguard uses **Zero-Knowledge Proofs (ZKPs)** to solve this:

- The SME's financial data (GST filings, bank statements, MCA registration) is processed off-chain by a ZK circuit
- The circuit produces a cryptographic **proof** that attests: *"This business meets creditworthiness threshold X"* — without revealing the underlying numbers
- Only this proof is published on-chain, keeping all private financial data fully confidential

This makes Vanguard compliant by design while remaining privacy-preserving — a critical requirement for institutional adoption.

---

### Feature 4: Chainlink Oracle Integration

When an invoice becomes due, Vanguard needs to know whether it was paid. This is the critical real-world bridge:

- **Chainlink Functions** connect to banking APIs and stablecoin transfer monitoring services
- When a payment event is detected (buyer transfers funds), the Oracle triggers an on-chain transaction
- The corresponding NFT's status is automatically updated from `ACTIVE` → `SETTLED`
- Liquidity is released back to investors with accrued yield
- If payment is missed, the NFT transitions to `DEFAULTED`, triggering the Junior Tranche's first-loss absorption mechanism

---

### Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VANGUARD PROTOCOL                        │
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐   │
│  │  Frontend   │    │   Backend    │    │  Smart Contracts  │   │
│  │             │    │              │    │                   │   │
│  │  Next.js    │◄──►│  Node.js /   │◄──►│  Solidity (EVM)   │   │
│  │  TypeScript │    │  TypeScript  │    │                   │   │
│  │  TailwindCSS│    │  Express     │    │  • InvoiceNFT.sol │   │
│  │  ethers.js  │    │  Prisma ORM  │    │  • LiquidityPool  │   │
│  │  wagmi      │    │  PostgreSQL  │    │  • TrancheMgr     │   │
│  └─────────────┘    └──────────────┘    │  • ZKVerifier     │   │
│                                         │  • OracleAdapter  │   │
│                      ┌──────────────┐   └───────────────────┘   │
│                      │  Integrations│                           │
│                      │              │    ┌──────────────────┐   │
│                      │  • QuickBooks│    │  External Oracle │   │
│                      │  • SAP       │◄──►│  Chainlink Funcs │   │
│                      │  • IPFS      │    │  Banking APIs    │   │
│                      │  • ZK Proofs │    └──────────────────┘   │
│                      └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

**Repository Structure:**

```
vanguard/
├── contracts/              # Solidity smart contracts (Hardhat)
│   ├── InvoiceNFT.sol      # ERC-721: represents a single invoice
│   ├── LiquidityPool.sol   # Manages Senior/Junior pool mechanics
│   ├── TrancheManager.sol  # Tranche risk/reward distribution
│   ├── ZKVerifier.sol      # On-chain ZK proof verification
│   └── OracleAdapter.sol   # Chainlink integration layer
│
├── backend/                # Node.js / TypeScript API server
│   ├── src/
│   │   ├── routes/         # REST API endpoints
│   │   ├── services/       # Business logic (invoice verification, etc.)
│   │   ├── oracle/         # Chainlink Functions listener
│   │   └── zk/             # ZK proof generation pipeline
│   └── prisma/             # Database schema
│
└── vanguard-finance/       # Next.js frontend
    ├── app/                # App router pages
    ├── components/         # UI components
    └── lib/                # ethers.js, wagmi config, API clients
```

---

## ✨ What Makes Vanguard Unique

### 1. Anti-Cyclical Value — Not Correlated to Crypto Markets

Most DeFi lending is **"circular"** — you deposit ETH to borrow USDC to buy more ETH. The yield comes from within the crypto ecosystem itself, which means when crypto crashes, the entire system deleverages simultaneously.

Vanguard is **fundamentally different**. The yield comes from Walmart paying its packaging supplier. From a manufacturer fulfilling a purchase order. From real commerce in the physical world. Bitcoin's price going to zero has no effect on whether Walmart pays its bills.

This makes Vanguard's yields:
- **Anti-cyclical** (uncorrelated to crypto market cycles)
- **Predictable** (invoice due dates are contractually fixed)
- **Real** (backed by legal payment obligations, not speculative activity)

### 2. The Dual-Tranche Design Solves the Liquidity Cold Start Problem

Every two-sided market faces the cold-start problem: investors won't join without deal flow, and SMEs won't join without liquidity. Most RWA projects fail here.

The Senior/Junior tranche model solves this by being attractive to **two completely different investor types** from day one — conservative institutions AND yield-hungry DeFi participants — ensuring the pool bootstraps itself.

### 3. Privacy by Default via ZK-KYB

No other RWA protocol currently implements Zero-Knowledge proofs for business verification at this level. Competitors either expose all financial data on-chain (unacceptable for regulated businesses) or rely on centralized, opaque credit scoring. Vanguard's ZK-KYB is a genuine technical differentiator.

### 4. Composable DeFi Infrastructure

Vanguard's pool tokens are composable — they can be used as collateral in other DeFi protocols, staked for governance, or traded on secondary markets. This turns a financing protocol into a full **DeFi credit primitive** that others can build on.

---

## 🚀 Project Setup

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** v18+ → [Download](https://nodejs.org/)
- **npm** v9+ (comes with Node.js)
- **Git** → [Download](https://git-scm.com/)
- **MetaMask** browser extension → [Install](https://metamask.io/)
- A code editor (VS Code recommended)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/senthan15/vanguard.git
cd vanguard
```

---

### Step 2: Set Up Smart Contracts (`/contracts`)

The contracts use **Hardhat** for compilation, testing, and local deployment.

```bash
# Navigate to the contracts directory
cd contracts

# Install dependencies
npm install

# Compile all Solidity contracts
npx hardhat compile

# Run the test suite
npx hardhat test

# Start a local Hardhat blockchain node (keep this terminal open)
npx hardhat node
```

**Deploy contracts to the local network** (open a new terminal):

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

After deployment, copy the printed contract addresses — you'll need them for the backend `.env`.

---

### Step 3: Set Up the Backend (`/backend`)

```bash
# Navigate to backend
cd ../backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Open `.env` and fill in the following:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/vanguard_db"

# Blockchain
RPC_URL="http://127.0.0.1:8545"
PRIVATE_KEY="<your-hardhat-test-account-private-key>"

# Contract Addresses (from Step 2 deployment output)
INVOICE_NFT_ADDRESS="0x..."
LIQUIDITY_POOL_ADDRESS="0x..."
TRANCHE_MANAGER_ADDRESS="0x..."

# IPFS (use Pinata or local node)
PINATA_API_KEY="your_pinata_api_key"
PINATA_SECRET_KEY="your_pinata_secret"

# Chainlink (for testnet deployments)
CHAINLINK_SUBSCRIPTION_ID="your_subscription_id"

# JWT Secret
JWT_SECRET="your_super_secret_jwt_key"
```

**Set up the database:**

```bash
# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npx prisma db seed
```

**Start the backend server:**

```bash
npm run dev
```

The API server will start on `http://localhost:3001`.

---

### Step 4: Set Up the Frontend (`/vanguard-finance`)

```bash
# Navigate to the frontend
cd ../vanguard-finance

# Install dependencies
npm install

# Create your environment file
cp .env.example .env.local
```

Open `.env.local` and configure:

```env
# Backend API
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Blockchain
NEXT_PUBLIC_RPC_URL="http://127.0.0.1:8545"
NEXT_PUBLIC_CHAIN_ID="31337"

# Contract Addresses (same as backend)
NEXT_PUBLIC_INVOICE_NFT_ADDRESS="0x..."
NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS="0x..."
```

**Start the frontend:**

```bash
npm run dev
```

The app will be running at `http://localhost:3000`.

---

### Step 5: Connect MetaMask to Local Network

1. Open MetaMask → Click network selector → **Add Network Manually**
2. Fill in:
   - **Network Name:** Hardhat Local
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** ETH
3. Import a test account using a private key from the `npx hardhat node` output (these are pre-funded test accounts — **never use them on mainnet**)

---

### Quick Start Summary

```bash
# Terminal 1 — Local blockchain
cd contracts && npx hardhat node

# Terminal 2 — Deploy contracts
cd contracts && npx hardhat run scripts/deploy.js --network localhost

# Terminal 3 — Backend API
cd backend && npm run dev

# Terminal 4 — Frontend
cd vanguard-finance && npm run dev
```

Open `http://localhost:3000`, connect MetaMask, and you're live. 🎉

---

### Testnet Deployment (Sepolia)

For deploying to the Ethereum Sepolia testnet:

1. Get test ETH from the [Sepolia Faucet](https://sepoliafaucet.com/)
2. Update `contracts/hardhat.config.js` with your Alchemy/Infura RPC URL
3. Add your wallet private key to the config (use environment variables, never hardcode)
4. Run:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

Update your `.env` files with the new Sepolia contract addresses and set `NEXT_PUBLIC_CHAIN_ID="11155111"`.

---

### Troubleshooting

| Issue | Fix |
|---|---|
| `ECONNREFUSED 8545` | Make sure `npx hardhat node` is running in a separate terminal |
| MetaMask nonce error | In MetaMask → Settings → Advanced → Reset Account |
| `prisma migrate` fails | Ensure PostgreSQL is running and `DATABASE_URL` is correct |
| Contract address mismatch | Re-deploy contracts and update all `.env` files with fresh addresses |
| IPFS upload fails | Verify your Pinata API keys or run a local IPFS node |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built for the future of inclusive finance. Vanguard — capital should flow where work happens.*
