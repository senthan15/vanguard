const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
    const provider = new ethers.JsonRpcProvider('https://api-mezame.shardeum.org/');
    const contractAddress = '0x77Cff71640b88b500ca27146BbEF41FaB0F94BD8';
    const abi = [
        "function invoices(uint256) view returns (address sme, address mnc, uint256 principal, uint256 repaymentAmount, string arweaveHash, uint8 status, uint256 launchTime)"
    ];

    const contract = new ethers.Contract(contractAddress, abi, provider);
    const tokenId = 33;
    const invoice = await contract.invoices(tokenId);

    console.log(`Invoice ${tokenId} Status:`, invoice.status);
    console.log(`SME:`, invoice.sme);
    console.log(`MNC:`, invoice.mnc);
    console.log(`Principal:`, invoice.principal.toString());
}

main().catch(console.error);
