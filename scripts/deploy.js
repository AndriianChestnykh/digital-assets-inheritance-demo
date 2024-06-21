// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require('fs');
const path = require("path");

const DIST = path.resolve(__dirname, "..");
const DEPLOY_INFO_FILE = "deployInfo.json"
const WALLET_CONTRACT = "Wallet";

const accounts = {
  Owner: {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      publicKey: '0x9adac7a7558764cf6bc45d88968b7d1e27b95e641c2827fba034350e91a44d22',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  Heir: {
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      publicKey: '0x107302eea84f3f75c50184df4102862bf50f6fbcee88bf9d7d33852ab90f302d',
      privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  },
  Oracle: {
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      publicKey: '0x9a09fdb91965386b6705c734ed36c3265144967b823e23a1b665ae8be922683c',
      privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  }
};

async function main() {
  const controler = (await hre.ethers.getSigners())[0].address;

  const gracePeriodBlocks = 50;

  const walletAmount = hre.ethers.utils.parseEther("1");
  const Wallet = await hre.ethers.getContractFactory(WALLET_CONTRACT);
  const wallet = await Wallet.deploy(controler, gracePeriodBlocks, { value: walletAmount });

  await wallet.deployed();

  console.log(
    `Wallet contract deployed to ${wallet.address}`
  );

  const Hub = await hre.ethers.getContractFactory("Hub");
  const hub = await Hub.deploy();
  hub.deployed();

  await hub.deployed();

  console.log(
    `Hub contract deployed to ${hub.address}`
  );

  await hub.registerPubKeyOwner(accounts.Owner.publicKey);
  await hub.registerPubKeyHeir(accounts.Heir.address, accounts.Heir.publicKey);
  await hub.registerPubKeyOracle(accounts.Oracle.address, accounts.Oracle.publicKey);

  fs.writeFileSync(
    path.resolve(DIST, DEPLOY_INFO_FILE),
    JSON.stringify({
      walletAddress: wallet.address,
      hubAddress: hub.address
    })
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
