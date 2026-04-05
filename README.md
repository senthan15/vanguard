# Vanguard - DeFi Invoice Funding on Shardeum

Vanguard is a decentralized invoice factoring platform built on **Shardeum Sphinx Testnet**. It enables SMEs to unlock liquidity from their receivables by tokenizing invoices as NFTs, which are then verified by MNCs and funded by yield-seeking investors.

---

## � Shardeum Deployment
- **Contract Address**: `0x77Cff71640b88b500ca27146BbEF41FaB0F94BD8`
- **Network**: Shardeum EVM Testnet
- **RPC**: https://api-mezame.shardeum.org/
- **Chain ID**: `8119`
- **Explorer**: [View Transitions on Shardeum Explorer](https://explorer-mezame.shardeum.org/address/0x77Cff71640b88b500ca27146BbEF41FaB0F94BD8?tab=txs)

---

## 🚀 Complete End-to-End Workflow

To test the platform as a hackathon judge, follow these steps:

### 1. SME: Anchor & Tokenize Invoice
- **Navigate to**: `http://localhost:8080/sme`
- **Action**: Connect your wallet, upload an invoice PDF, enter amount (e.g., 500 USDC), and click **"Upload & Anchor"**.
- **Blockchain Result**: A new Invoice NFT is minted and stored in the contract. Metadata is anchored on-chain.

### 2. MNC: Verify & Sign (EIP-712)
- **Navigate to**: `http://localhost:8080/mnc`
- **Action**: Locate your pending invoice, click **"Verify"**, review the EIP-712 typed data preview, and **Sign with MetaMask**.
- **Blockchain Result**: The invoice status is updated to `Verified` on-chain, making it eligible for funding.

### 3. Investor: Mint USDC & Fund
- **Navigate to**: `http://localhost:8080/investor`
- **Action**: 
    1. Click **"Mint 5k"** in the top right to get testnet USDC (if needed).
    2. Browse the "Verified Invoice NFTs" section.
    3. Click **"Fund Now"** on your verified invoice.
    4. Approve MetaMask spending and confirm the transaction.
- **Blockchain Result**: USDC is transferred from the investor to the SME, and the NFT ownership is transferred to the investor. Status: `Funded`.

---

## � Technical Setup

### Backend (Relayer & Metadata Engine)
1. `cd backend`
2. `npm install`
3. `node server.js` (Runs on port `3002`)
> [!NOTE]
> System uses local `database.json` for metadata persistence if Firebase is not configured.

### Frontend (User Interface)
1. `cd vanguard-finance`
2. `npm install`
3. `npm run dev` (Runs on port `8080`)

---

## �️ Technology Stack
- **Blockchain**: Solidity, Ethers.js v6, Shardeum Sphinx
- **Signatures**: EIP-712 Typed Data Signatures for gas-less MNC verification off-chain
- **Frontend**: React, TypeScript, Vite, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **Storage**: Arweave (Anchoring), Firebase/Local JSON (Metadata)

---

## 📊 Status Flow
`Anchored (SME)` → `Verified (MNC)` → `Funded (Investor)` → `Repaid (MNC)` → `Settled (Investor)`

---

**Vanguard - Empowering Global Trade with Decentralized Finance on Shardeum.**
