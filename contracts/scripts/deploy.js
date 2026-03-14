const hre = require("hardhat");

async function main() {
    console.log("Starting deployment...");

    // 1. Deploy MockUSDC (ALREADY DEPLOYED)
    // const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    // const usdc = await MockUSDC.deploy();
    // await usdc.waitForDeployment();
    // const usdcAddress = await usdc.getAddress();
    const usdcAddress = "0x672930e512776E984d7b14D34e546b45911fc748";
    console.log(`MockUSDC (Existing): ${usdcAddress}`);

    // 2. Deploy InvoiceNFTManager
    const InvoiceNFTManager = await hre.ethers.getContractFactory("InvoiceNFTManager");

    // Check Gas Price
    const feeData = await hre.ethers.provider.getFeeData();
    console.log(`Current Gas Price: ${feeData.gasPrice}`);

    const manager = await InvoiceNFTManager.deploy(usdcAddress, {
        gasLimit: 4500000,
        // gasPrice: feeData.gasPrice 
    });
    await manager.waitForDeployment();
    const managerAddress = await manager.getAddress();
    console.log(`InvoiceNFTManager deployed to: ${managerAddress}`);

    // 3. Setup (Add authorized MNC if provided)
    const mncAddress = process.env.MNC_ADDRESS;
    if (mncAddress) {
        await manager.addAuthorizedMnc(mncAddress);
        console.log(`Authorized MNC: ${mncAddress}`);
    } else {
        // Authorize deployer for testing
        const [deployer] = await hre.ethers.getSigners();
        await manager.addAuthorizedMnc(deployer.address);
        console.log(`Authorized MNC (Self/Deployer): ${deployer.address}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
