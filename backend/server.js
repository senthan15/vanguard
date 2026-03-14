require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cors()); // Allows other laptops to connect

// 1. Setup Provider & Signer
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 2. Complete Contract ABI
const abi = [
    // Write Functions
    "function anchorInvoice(string memory _arweaveHash, string memory _tokenURI) external",
    "function verifyInvoice(uint256 _tokenId, uint256 _amount, bytes memory _signature) external",
    "function invest(uint256 _tokenId) external",
    "function repay(uint256 _tokenId, uint256 _repaymentAmount) external",
    "function claim(uint256 _tokenId) external",
    "function addAuthorizedMnc(address _mnc) external",

    // View Functions
    "function invoices(uint256) view returns (address sme, address mnc, uint256 principal, uint256 repaymentAmount, string arweaveHash, uint8 status, uint256 launchTime)",
    "function authorizedMNCs(address) view returns (bool)",
    "function interestReserve(uint256) view returns (uint256)",
    "function calculateN(uint256 _launchTime) view returns (uint256)",
    "function nextTokenId() view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function usdcToken() view returns (address)",

    // Events
    "event InvoiceAnchored(uint256 indexed tokenId, address indexed sme, string arweaveHash)",
    "event InvoiceVerified(uint256 indexed tokenId, address indexed mnc, uint256 amount)",
    "event InvoiceFunded(uint256 indexed tokenId, address indexed investor)",
    "event InvoiceRepaid(uint256 indexed tokenId, uint256 amount)",
    "event InvoiceSettled(uint256 indexed tokenId, address indexed investor, uint256 payout)"
];

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

// USDC Token ABI for approvals and balance checks
const usdcAbi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
];

// Get USDC contract address from the main contract
let usdcContract;
(async () => {
    const usdcAddress = await contract.usdcToken();
    usdcContract = new ethers.Contract(usdcAddress, usdcAbi, wallet);
})();

// ============================================
// 3. API ENDPOINTS
// ============================================

// --------------------------------------------
// SME ENDPOINTS
// --------------------------------------------

// SME: Anchor Invoice
// SME: Anchor Invoice
app.post('/api/sme/anchor', async (req, res) => {
    try {
        const { arweaveHash, tokenURI, amount, dueDate, smeAddress } = req.body;

        if (!arweaveHash || !tokenURI) {
            return res.status(400).json({ error: 'arweaveHash and tokenURI are required' });
        }

        // Get current nonce to prevent nonce mismatch errors
        const nonce = await provider.getTransactionCount(wallet.address, 'pending');
        console.log(`Using nonce: ${nonce} for wallet: ${wallet.address}`);

        const tx = await contract.anchorInvoice(arweaveHash, tokenURI, { nonce });
        const receipt = await tx.wait();

        // Extract tokenId from event
        const event = receipt.logs.find(log => {
            try {
                return contract.interface.parseLog(log).name === 'InvoiceAnchored';
            } catch {
                return false;
            }
        });

        const tokenId = event ? contract.interface.parseLog(event).args.tokenId.toString() : null;

        // Save to DB
        if (tokenId) {
            await db.saveInvoice({
                tokenId,
                arweaveHash,
                tokenURI,
                amount: amount || '0', // SME claimed amount
                dueDate,
                smeAddress: smeAddress || 'Unknown',
                status: 'Anchored', // 0
                txHash: tx.hash,
                createdAt: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            txHash: tx.hash,
            tokenId: tokenId,
            message: 'Invoice anchored successfully'
        });
    } catch (error) {
        console.error('Anchor error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --------------------------------------------
// MNC ENDPOINTS
// --------------------------------------------

// Owner: Add Authorized MNC
app.post('/api/mnc/authorize', async (req, res) => {
    try {
        const { mncAddress } = req.body;

        if (!mncAddress || !ethers.isAddress(mncAddress)) {
            return res.status(400).json({ error: 'Valid mncAddress is required' });
        }

        // Get current nonce
        const nonce = await provider.getTransactionCount(wallet.address, 'pending');
        console.log(`Authorize - Using nonce: ${nonce}`);

        const tx = await contract.addAuthorizedMnc(mncAddress, { nonce });
        await tx.wait();

        res.json({
            success: true,
            txHash: tx.hash,
            message: `MNC ${mncAddress} authorized successfully`
        });
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: error.message });
    }
});

// MNC: Verify Invoice (requires EIP-712 signature)
// MNC: Verify Invoice (requires EIP-712 signature)
app.post('/api/mnc/verify', async (req, res) => {
    try {
        const { tokenId, amount, signature } = req.body;

        if (tokenId === undefined || !amount || !signature) {
            return res.status(400).json({ error: 'tokenId, amount, and signature are required' });
        }

        // Get current nonce to prevent nonce mismatch errors
        const nonce = await provider.getTransactionCount(wallet.address, 'pending');
        console.log(`Verify - Using nonce: ${nonce}`);

        const tx = await contract.verifyInvoice(tokenId, amount, signature, { nonce });
        await tx.wait();

        // Update DB
        const invoice = await db.getInvoice(tokenId.toString());
        if (invoice) {
            invoice.status = 'Verified';
            invoice.evaluatedAmount = amount; // The amount verified by MNC
            invoice.mncSignature = signature;
            await db.saveInvoice(invoice);
        }

        res.json({
            success: true,
            txHash: tx.hash,
            message: `Invoice ${tokenId} verified successfully`
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: error.message });
    }
});

// MNC: Repay Invoice
app.post('/api/mnc/repay', async (req, res) => {
    try {
        const { tokenId, repaymentAmount } = req.body;

        if (tokenId === undefined || !repaymentAmount) {
            return res.status(400).json({ error: 'tokenId and repaymentAmount are required' });
        }

        // Get nonces for both transactions
        let nonce = await provider.getTransactionCount(wallet.address, 'pending');
        console.log(`Repay - Using nonce: ${nonce} for approve`);

        // First approve USDC transfer
        const approveTx = await usdcContract.approve(process.env.CONTRACT_ADDRESS, repaymentAmount, { nonce });
        await approveTx.wait();

        // Increment nonce for second transaction
        nonce++;
        console.log(`Repay - Using nonce: ${nonce} for repay`);

        // Then repay
        const tx = await contract.repay(tokenId, repaymentAmount, { nonce });
        await tx.wait();

        res.json({
            success: true,
            txHash: tx.hash,
            approveTxHash: approveTx.hash,
            message: `Invoice ${tokenId} repaid with ${repaymentAmount}`
        });
    } catch (error) {
        console.error('Repayment error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check if MNC is authorized
app.get('/api/mnc/:address/authorized', async (req, res) => {
    try {
        const { address } = req.params;

        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid address' });
        }

        const isAuthorized = await contract.authorizedMNCs(address);

        res.json({
            address: address,
            isAuthorized: isAuthorized
        });
    } catch (error) {
        console.error('Authorization check error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --------------------------------------------
// INVESTOR ENDPOINTS
// --------------------------------------------

// Investor: Invest in Invoice
// Investor: Invest in Invoice
app.post('/api/investor/invest', async (req, res) => {
    try {
        const { tokenId, investorPrivateKey } = req.body;

        if (tokenId === undefined) {
            return res.status(400).json({ error: 'tokenId is required' });
        }

        // Get invoice details to know the amount
        const invoice = await contract.invoices(tokenId);
        const amount = invoice.principal;

        // Create investor wallet
        const investorWallet = investorPrivateKey
            ? new ethers.Wallet(investorPrivateKey, provider)
            : wallet; // Use default wallet if no investor wallet provided

        const investorUsdcContract = new ethers.Contract(await contract.usdcToken(), usdcAbi, investorWallet);
        const investorContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, investorWallet);

        // Get nonces for both transactions
        let nonce = await provider.getTransactionCount(investorWallet.address, 'pending');
        console.log(`Invest - Using nonce: ${nonce} for approve`);

        // First approve USDC transfer
        const approveTx = await investorUsdcContract.approve(process.env.CONTRACT_ADDRESS, amount, { nonce });
        await approveTx.wait();

        // Increment nonce for invest transaction
        nonce++;
        console.log(`Invest - Using nonce: ${nonce} for invest`);

        // Then invest
        const tx = await investorContract.invest(tokenId, { nonce });
        await tx.wait();

        // Update DB
        await db.updateInvoiceStatus(tokenId.toString(), 'Funded');

        res.json({
            success: true,
            txHash: tx.hash,
            approveTxHash: approveTx.hash,
            amount: amount.toString(),
            message: `Successfully invested ${amount.toString()} in invoice ${tokenId}`
        });
    } catch (error) {
        console.error('Investment error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Investor: Confirm Investment (called after frontend transaction)
app.post('/api/investor/confirm-investment', async (req, res) => {
    try {
        const { tokenId, txHash } = req.body;

        if (tokenId === undefined || !txHash) {
            return res.status(400).json({ error: 'tokenId and txHash are required' });
        }

        console.log(`Confirming investment for token ${tokenId} (TX: ${txHash})`);

        // Update DB
        await db.updateInvoiceStatus(tokenId.toString(), 'Funded');

        res.json({
            success: true,
            message: `Successfully confirmed investment for invoice ${tokenId}`
        });
    } catch (error) {
        console.error('Confirmation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Investor: Claim Payout
app.post('/api/investor/claim', async (req, res) => {
    try {
        const { tokenId, investorPrivateKey } = req.body;

        if (tokenId === undefined) {
            return res.status(400).json({ error: 'tokenId is required' });
        }

        // Create investor wallet
        const investorWallet = investorPrivateKey
            ? new ethers.Wallet(investorPrivateKey, provider)
            : wallet;

        const investorContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, investorWallet);

        const tx = await investorContract.claim(tokenId);
        const receipt = await tx.wait();

        // Extract payout amount from event
        const event = receipt.logs.find(log => {
            try {
                return contract.interface.parseLog(log).name === 'InvoiceSettled';
            } catch {
                return false;
            }
        });

        const payout = event ? contract.interface.parseLog(event).args.payout.toString() : null;

        res.json({
            success: true,
            txHash: tx.hash,
            payout: payout,
            message: `Successfully claimed payout for invoice ${tokenId}`
        });
    } catch (error) {
        console.error('Claim error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --------------------------------------------
// QUERY ENDPOINTS
// --------------------------------------------

// Get Complete Invoice Details
app.get('/api/invoice/:id', async (req, res) => {
    try {
        const tokenId = req.params.id;
        const invoice = await contract.invoices(tokenId);

        // Get NFT owner
        let owner;
        try {
            owner = await contract.ownerOf(tokenId);
        } catch {
            owner = null; // NFT might not exist yet
        }

        // Calculate N value
        const nValue = invoice.launchTime > 0 ? await contract.calculateN(invoice.launchTime) : null;

        // Get interest reserve
        const reserve = await contract.interestReserve(tokenId);

        res.json({
            tokenId: tokenId,
            sme: invoice.sme,
            mnc: invoice.mnc,
            principal: invoice.principal.toString(),
            repaymentAmount: invoice.repaymentAmount.toString(),
            arweaveHash: invoice.arweaveHash,
            status: Number(invoice.status),
            statusText: getStatusText(Number(invoice.status)),
            launchTime: invoice.launchTime.toString(),
            nValue: nValue ? nValue.toString() : null,
            interestReserve: reserve.toString(),
            currentOwner: owner
        });
    } catch (error) {
        console.error('Invoice query error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Calculate N value for a given launch time
app.get('/api/invoice/:id/calculate-n', async (req, res) => {
    try {
        const tokenId = req.params.id;
        const invoice = await contract.invoices(tokenId);

        if (invoice.launchTime == 0) {
            return res.status(400).json({ error: 'Invoice not yet launched' });
        }

        const nValue = await contract.calculateN(invoice.launchTime);
        const timeElapsed = Math.floor(Date.now() / 1000) - Number(invoice.launchTime);

        res.json({
            tokenId: tokenId,
            launchTime: invoice.launchTime.toString(),
            currentTime: Math.floor(Date.now() / 1000),
            timeElapsedSeconds: timeElapsed,
            nValue: nValue.toString(),
            description: nValue.toString() === '10' ? 'Early investment (< 24h)' : 'Standard investment (>= 24h)'
        });
    } catch (error) {
        console.error('Calculate N error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Next Token ID
app.get('/api/next-token-id', async (req, res) => {
    try {
        const nextId = await contract.nextTokenId();
        res.json({ nextTokenId: nextId.toString() });
    } catch (error) {
        console.error('Next token ID error:', error);
        res.status(500).json({ error: error.message });
    }
});

// List All Invoices (Iterative Fetch)
// List All Invoices (Fetch from DB)
app.get('/api/invoices', async (req, res) => {
    try {
        // Fetch from Database for speed and metadata
        const dbInvoices = await db.getAllInvoices();

        // Transform for Frontend
        const invoices = dbInvoices.map(inv => ({
            id: `inv-${inv.tokenId}`,
            tokenId: inv.tokenId,
            sme: inv.smeAddress, // From DB metadata
            amount: Number(inv.amount), // Claimed amount
            principal: inv.amount,
            currency: "USDC",
            issuer: `SME: ${inv.smeAddress.substring(0, 6)}...`,
            dueDate: inv.dueDate || "2026-12-31",
            status: inv.status,
            statusCode: getStatusCode(inv.status),
            arweaveHash: inv.arweaveHash,
            launchTime: inv.createdAt
        }));

        res.json({ success: true, invoices: invoices });

    } catch (error) {
        console.error('List invoices error:', error);
        res.status(500).json({ error: error.message });
    }
});

function getStatusCode(statusText) {
    const map = { 'Anchored': 0, 'Verified': 1, 'Funded': 2, 'Repaid': 3, 'Settled': 4 };
    return map[statusText] || 0;
}

// --------------------------------------------
// USDC UTILITY ENDPOINTS
// --------------------------------------------

// Check USDC Balance
app.get('/api/usdc/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;

        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid address' });
        }

        if (!usdcContract) {
            const usdcAddress = await contract.usdcToken();
            usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);
        }

        const balance = await usdcContract.balanceOf(address);

        res.json({
            address: address,
            balance: balance.toString(),
            balanceFormatted: ethers.formatUnits(balance, 6) // USDC has 6 decimals
        });
    } catch (error) {
        console.error('Balance check error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check USDC Allowance
app.get('/api/usdc/allowance/:owner/:spender', async (req, res) => {
    try {
        const { owner, spender } = req.params;

        if (!ethers.isAddress(owner) || !ethers.isAddress(spender)) {
            return res.status(400).json({ error: 'Invalid address' });
        }

        if (!usdcContract) {
            const usdcAddress = await contract.usdcToken();
            usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);
        }

        const allowance = await usdcContract.allowance(owner, spender);

        res.json({
            owner: owner,
            spender: spender,
            allowance: allowance.toString(),
            allowanceFormatted: ethers.formatUnits(allowance, 6)
        });
    } catch (error) {
        console.error('Allowance check error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function to convert status number to text
function getStatusText(status) {
    const statusMap = {
        0: 'Anchored',
        1: 'Verified',
        2: 'Funded',
        3: 'Repaid',
        4: 'Settled'
    };
    return statusMap[status] || 'Unknown';
}

// 4. LISTEN ON 0.0.0.0 (CRITICAL FOR MULTI-LAPTOP ACCESS)
const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Other laptops use: http://YOUR_IP_ADDRESS:${PORT}`);
});