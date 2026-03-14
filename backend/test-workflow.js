const axios = require('axios');
const { signInvoiceVerification } = require('./sign-eip712');
require('dotenv').config();

const API_URL = 'http://localhost:3002';

// Test addresses
const MNC_PRIVATE_KEY = process.env.PRIVATE_KEY; // Using server wallet as MNC for testing
const INVESTOR_PRIVATE_KEY = process.env.PRIVATE_KEY; // Using server wallet as investor for testing

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCompleteWorkflow() {
    try {
        console.log('🚀 Starting Complete Invoice Funding Workflow Test\n');
        console.log('='.repeat(60));

        // Step 1: Authorize MNC
        console.log('\n📋 Step 1: Authorizing MNC...');
        const mncAddress = '0x64B76B70bc6Bbf5c3107E5195B126EA13e701210'; // Server wallet address

        const authResponse = await axios.post(`${API_URL}/api/mnc/authorize`, {
            mncAddress: mncAddress
        });

        console.log('✅ MNC Authorized');
        console.log('   TX Hash:', authResponse.data.txHash);
        await sleep(3000); // Wait for transaction

        // Verify authorization
        const authCheck = await axios.get(`${API_URL}/api/mnc/${mncAddress}/authorized`);
        console.log('   Authorization Status:', authCheck.data.isAuthorized);

        // Step 2: SME Anchors Invoice
        console.log('\n📋 Step 2: SME Anchoring Invoice...');
        const arweaveHash = `workflow-test-${Date.now()}`;
        const tokenURI = `ipfs://workflow-test-${Date.now()}`;

        const anchorResponse = await axios.post(`${API_URL}/api/sme/anchor`, {
            arweaveHash: arweaveHash,
            tokenURI: tokenURI
        });

        const tokenId = anchorResponse.data.tokenId;
        console.log('✅ Invoice Anchored');
        console.log('   Token ID:', tokenId);
        console.log('   TX Hash:', anchorResponse.data.txHash);
        await sleep(3000);

        // Step 3: MNC Verifies Invoice with EIP-712 Signature
        console.log('\n📋 Step 3: MNC Verifying Invoice...');
        const principal = '5000000'; // 5 USDC (6 decimals)

        console.log('   Generating EIP-712 signature...');
        const signature = await signInvoiceVerification(MNC_PRIVATE_KEY, arweaveHash, principal);
        console.log('   Signature:', signature.substring(0, 20) + '...');

        const verifyResponse = await axios.post(`${API_URL}/api/mnc/verify`, {
            tokenId: tokenId,
            amount: principal,
            signature: signature
        });

        console.log('✅ Invoice Verified');
        console.log('   TX Hash:', verifyResponse.data.txHash);
        console.log('   Principal:', principal);
        await sleep(3000);

        // Check invoice status
        const invoiceAfterVerify = await axios.get(`${API_URL}/api/invoice/${tokenId}`);
        console.log('   Status:', invoiceAfterVerify.data.statusText);

        // Step 4: Investor Invests
        console.log('\n📋 Step 4: Investor Investing...');

        const investResponse = await axios.post(`${API_URL}/api/investor/invest`, {
            tokenId: tokenId,
            investorPrivateKey: INVESTOR_PRIVATE_KEY
        });

        console.log('✅ Investment Complete');
        console.log('   TX Hash:', investResponse.data.txHash);
        console.log('   Approve TX Hash:', investResponse.data.approveTxHash);
        console.log('   Amount Invested:', investResponse.data.amount);
        await sleep(3000);

        // Check invoice status
        const invoiceAfterInvest = await axios.get(`${API_URL}/api/invoice/${tokenId}`);
        console.log('   Status:', invoiceAfterInvest.data.statusText);
        console.log('   NFT Owner:', invoiceAfterInvest.data.currentOwner);

        // Step 5: MNC Repays
        console.log('\n📋 Step 5: MNC Repaying Invoice...');
        // Calculate correct repayment: principal + (principal * N * rate) / 100
        // N=10 for early investment (<24h), rate=5%
        // Interest = (5000000 * 10 * 5) / 100 = 2,500,000
        // Total = 5,000,000 + 2,500,000 = 7,500,000
        const repaymentAmount = '7500000'; // 7.5 USDC

        const repayResponse = await axios.post(`${API_URL}/api/mnc/repay`, {
            tokenId: tokenId,
            repaymentAmount: repaymentAmount
        });

        console.log('✅ Invoice Repaid');
        console.log('   TX Hash:', repayResponse.data.txHash);
        console.log('   Approve TX Hash:', repayResponse.data.approveTxHash);
        console.log('   Repayment Amount:', repaymentAmount);
        await sleep(3000);

        // Check invoice status
        const invoiceAfterRepay = await axios.get(`${API_URL}/api/invoice/${tokenId}`);
        console.log('   Status:', invoiceAfterRepay.data.statusText);
        console.log('   Repayment Amount:', invoiceAfterRepay.data.repaymentAmount);

        // Step 6: Investor Claims Payout
        console.log('\n📋 Step 6: Investor Claiming Payout...');

        const claimResponse = await axios.post(`${API_URL}/api/investor/claim`, {
            tokenId: tokenId,
            investorPrivateKey: INVESTOR_PRIVATE_KEY
        });

        console.log('✅ Payout Claimed');
        console.log('   TX Hash:', claimResponse.data.txHash);
        console.log('   Payout Amount:', claimResponse.data.payout);
        await sleep(3000);

        // Final invoice status
        const finalInvoice = await axios.get(`${API_URL}/api/invoice/${tokenId}`);
        console.log('   Final Status:', finalInvoice.data.statusText);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 COMPLETE WORKFLOW TEST SUCCESSFUL!');
        console.log('='.repeat(60));
        console.log('\nWorkflow Summary:');
        console.log(`   Token ID: ${tokenId}`);
        console.log(`   Arweave Hash: ${arweaveHash}`);
        console.log(`   Principal: ${principal}`);
        console.log(`   Repayment: ${repaymentAmount}`);
        console.log(`   Final Payout: ${claimResponse.data.payout}`);
        console.log(`   Final Status: ${finalInvoice.data.statusText}`);
        console.log('\nAll steps completed successfully! ✅');

    } catch (error) {
        console.error('\n❌ Error during workflow test:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Error:', error.response.data.error);
        } else {
            console.error('   Error:', error.message);
        }
        process.exit(1);
    }
}

// Run the test
testCompleteWorkflow();
