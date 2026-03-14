const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

const dbPath = './database.json';

async function main() {
    const provider = new ethers.JsonRpcProvider('https://api-mezame.shardeum.org/');
    const contractAddress = '0x77Cff71640b88b500ca27146BbEF41FaB0F94BD8';
    const abi = [
        "function invoices(uint256) view returns (address sme, address mnc, uint256 principal, uint256 repaymentAmount, string arweaveHash, uint8 status, uint256 launchTime)",
        "function nextTokenId() view returns (uint256)"
    ];

    const contract = new ethers.Contract(contractAddress, abi, provider);
    const database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    const statusMap = {
        0: 'Anchored',
        1: 'Verified',
        2: 'Funded',
        3: 'Repaid',
        4: 'Settled'
    };

    console.log("Starting sync...");

    for (const tokenIdStr in database.invoices) {
        const tokenId = parseInt(tokenIdStr);
        try {
            const invoice = await contract.invoices(tokenId);
            const onChainStatus = statusMap[parseInt(invoice.status)] || 'Unknown';
            const localStatus = database.invoices[tokenIdStr].status;

            if (onChainStatus !== localStatus) {
                console.log(`Syncing Token ${tokenId}: ${localStatus} -> ${onChainStatus}`);
                database.invoices[tokenIdStr].status = onChainStatus;
            }
        } catch (e) {
            console.error(`Error syncing Token ${tokenId}:`, e.message);
        }
    }

    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
    console.log("Sync complete!");
}

main().catch(console.error);
