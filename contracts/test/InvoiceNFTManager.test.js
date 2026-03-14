const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InvoiceNFTManager", function () {
    let InvoiceNFTManager, manager, MockUSDC, usdc;
    let owner, mnc, sme, investor;

    beforeEach(async function () {
        [owner, mnc, sme, investor] = await ethers.getSigners();

        // Deploy MockUSDC
        MockUSDC = await ethers.getContractFactory("MockUSDC");
        usdc = await MockUSDC.deploy();
        await usdc.waitForDeployment();

        // Deploy InvoiceNFTManager
        InvoiceNFTManager = await ethers.getContractFactory("InvoiceNFTManager");
        manager = await InvoiceNFTManager.deploy(await usdc.getAddress());
        await manager.waitForDeployment();

        // Authorize MNC
        await manager.addAuthorizedMnc(mnc.address);

        // Mint USDC to Investor
        await usdc.mint(investor.address, ethers.parseUnits("10000", 18));
    });

    it("Should anchor an invoice", async function () {
        const arweaveHash = "ar_hash_123";
        const tokenURI = "ar://token_uri";

        await manager.connect(sme).anchorInvoice(arweaveHash, tokenURI);

        const invoice = await manager.invoices(0);
        expect(invoice.sme).to.equal(sme.address);
        expect(invoice.status).to.equal(0); // Anchored
    });

    it("Should verify an invoice with valid signature", async function () {
        // 1. Anchor
        await manager.connect(sme).anchorInvoice("ar_hash_123", "uri");

        // 2. Sign (EIP-712)
        const chainId = (await ethers.provider.getNetwork()).chainId;
        const domain = {
            name: "InvoiceManager",
            version: "1",
            chainId: chainId,
            verifyingContract: await manager.getAddress()
        };

        const types = {
            Invoice: [
                { name: "arweaveHash", type: "string" },
                { name: "amount", type: "uint256" }
            ]
        };

        const amount = ethers.parseUnits("1000", 18);
        const value = {
            arweaveHash: "ar_hash_123",
            amount: amount
        };

        const signature = await mnc.signTypedData(domain, types, value);

        // 3. Verify
        await manager.connect(mnc).verifyInvoice(0, amount, signature);

        const invoice = await manager.invoices(0);
        expect(invoice.status).to.equal(1); // Verified
        expect(invoice.principal).to.equal(amount);
    });
});
