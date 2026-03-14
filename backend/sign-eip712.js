const { ethers } = require('ethers');
require('dotenv').config();

// Contract details
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const DOMAIN_NAME = "InvoiceManager";
const DOMAIN_VERSION = "1";
const CHAIN_ID = 8119; // Shardeum Sphinx testnet chain ID

// EIP-712 Domain
const domain = {
    name: DOMAIN_NAME,
    version: DOMAIN_VERSION,
    chainId: CHAIN_ID,
    verifyingContract: CONTRACT_ADDRESS
};

// EIP-712 Types
const types = {
    Invoice: [
        { name: "arweaveHash", type: "string" },
        { name: "amount", type: "uint256" }
    ]
};

/**
 * Generate EIP-712 signature for invoice verification
 * @param {string} privateKey - MNC's private key
 * @param {string} arweaveHash - Invoice arweave hash
 * @param {string} amount - Principal amount
 * @returns {string} signature
 */
async function signInvoiceVerification(privateKey, arweaveHash, amount) {
    const wallet = new ethers.Wallet(privateKey);

    const value = {
        arweaveHash: arweaveHash,
        amount: amount
    };

    const signature = await wallet.signTypedData(domain, types, value);

    return signature;
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 3) {
        console.log('Usage: node sign-eip712.js <privateKey> <arweaveHash> <amount>');
        console.log('Example: node sign-eip712.js 0x123... test-hash-123 1000000');
        process.exit(1);
    }

    const [privateKey, arweaveHash, amount] = args;

    signInvoiceVerification(privateKey, arweaveHash, amount)
        .then(signature => {
            console.log('EIP-712 Signature Generated:');
            console.log(signature);
        })
        .catch(error => {
            console.error('Error:', error.message);
            process.exit(1);
        });
}

module.exports = { signInvoiceVerification };
