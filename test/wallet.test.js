const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");


const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { splitSignature } = require("ethers/lib/utils");

async function deployWalletFixture() {
  const [ownerSigner, heirSigner, receiverSigner] = await ethers.getSigners();
  const gracePeriodBlocks = 10;
  const walletAmount = ethers.utils.parseEther("1");

  const Wallet = await ethers.getContractFactory("Wallet");
  const wallet = await Wallet.deploy(ownerSigner.address, gracePeriodBlocks, { value: walletAmount });
  wallet.deployed();

  const tokenERC20Supply = 1000;
  const TokenERC20 = await ethers.getContractFactory("GLDToken");
  const tokenERC20 = await TokenERC20.deploy(wallet.address, tokenERC20Supply);
  tokenERC20.deployed();

  const TokenERC721 = await ethers.getContractFactory("GameItem");
  const tokenERC721 = await TokenERC721.deploy();
  tokenERC721.deployed();
  await tokenERC721.awardItem(wallet.address, "https://game.example/item-id-1.json");
  await tokenERC721.awardItem(wallet.address, "https://game.example/item-id-2.json");
  await tokenERC721.awardItem(wallet.address, "https://game.example/item-id-3.json");

  return { wallet, gracePeriodBlocks, walletAmount, tokenERC20, tokenERC721, ownerSigner, heirSigner, receiverSigner }
}

async function redirectTxToWallet(signer, walletContract, targetContract, methodName, methodArgs, value) {
  // estimate on begalf of wallet contract as tx sender
  const gasEstimation = await targetContract.connect(walletContract.address).estimateGas[methodName](...methodArgs);
  const gasLimit = gasEstimation.add(100000);
  const gasPrice = ethers.utils.parseUnits('10', 'gwei');

  const originalEncoding = targetContract.interface.encodeFunctionData(methodName, methodArgs);

  // this is just a concatenation of the target contract address and the original encoding without the function selector
  const modifiedEncoding = originalEncoding.slice(0, 10) // function selector
    + targetContract.address.slice(2).padStart(64, '0') // address
    + originalEncoding.slice(10); // bytes data

  let privateKey;
  if (signer.address.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266") {
    privateKey = 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  } else if (signer.address.toLowerCase() === "0x70997970c51812dc3a010c7d01b50e0d17dc79c8") {
    privateKey = '59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
  } else {
    throw new Error("Unknown signer");
  }

  const wallet = new ethers.Wallet(privateKey, ethers.provider);
  const nonce = await wallet.getTransactionCount();

  const transaction = {
    to: walletContract.address,
    data: modifiedEncoding,
    gasLimit: gasLimit,
    gasPrice: gasPrice,
    value: BigNumber.from(value || 0),
    nonce: nonce,
  };

  const signedTransaction = await wallet.signTransaction(transaction);
  await ethers.provider.sendTransaction(signedTransaction);
}

async function checkCanSend(wallet, signer, receiverSigner, amount, tokenId, tokenERC20, tokenERC721) {
  await expect(
    wallet.connect(signer).send(receiverSigner.address, amount)
  ).to.changeEtherBalance(receiverSigner, amount);

  const balanceBefore = await tokenERC20.balanceOf(receiverSigner.address);
  await redirectTxToWallet(signer, wallet, tokenERC20, "transfer", [receiverSigner.address, 10], 0)
  expect(await tokenERC20.balanceOf(receiverSigner.address)).to.be.equal(balanceBefore.add(10));

  await redirectTxToWallet(signer, wallet, tokenERC721, "transferFrom", [wallet.address, receiverSigner.address, tokenId], 0);
  expect(await tokenERC721.ownerOf(tokenId)).to.be.equal(receiverSigner.address);
}

async function checkCanNotSend(wallet, signer, receiverSigner, amount, tokenId, tokenERC20, tokenERC721) {
  await expect(
    wallet.connect(signer).send(receiverSigner.address, amount)
  ).to.be.revertedWith("Controller check failed");

  await expect(
    redirectTxToWallet(signer, wallet, tokenERC20, "transfer", [receiverSigner.address, 10])
  ).to.be.revertedWith("Controller check failed");

  await expect(
    redirectTxToWallet(signer, wallet, tokenERC721, "transferFrom", [wallet.address, receiverSigner.address, tokenId])
  ).to.be.revertedWith("Controller check failed");
}

describe("Wallet life cycle", function () {
  let wallet, gracePeriodBlocks, walletAmount, tokenERC20, tokenERC721, ownerSigner, heirSigner, receiverSigner;
  let pendingControllerCommitBlock;
  const amount = ethers.utils.parseEther("0.1");

  before(async function () {
    ({ wallet, gracePeriodBlocks, walletAmount, tokenERC20, tokenERC721, ownerSigner, heirSigner, receiverSigner }
      = await loadFixture(deployWalletFixture)
    );
  });

  it("Owner can send any assets", async () => {
    const tokenId = 0;
    await checkCanSend(wallet, ownerSigner, receiverSigner, amount, tokenId, tokenERC20, tokenERC721);
  });

  it("Heir can't send any assets", async () => {
    let tokenId = 1;
    await checkCanNotSend(wallet, heirSigner, receiverSigner, amount, tokenId, tokenERC20, tokenERC721);
  });

  it("Heir can init controller change by IM", async () => {
    const chainId = await ownerSigner.getChainId();
    const walletAddress = wallet.address;

    const typedData = {
      types: {
        InheritanceMessage: [
          { name: 'heirAddress', type: 'address' },
        ],
      },
      primaryType: 'InheritanceMessage',
      domain: {
        name: 'InheritanceMessage',
        version: '1',
        chainId,
        verifyingContract: walletAddress,
      },
      message: {
        heirAddress: heirSigner.address,
      },
    };

    const signature = await ownerSigner._signTypedData(typedData.domain, typedData.types, typedData.message);
    const splitedSignature = splitSignature(signature);

    await wallet.connect(heirSigner).initControllerChange(
      heirSigner.address,
      { heirAddress: heirSigner.address },
      splitedSignature.r,
      splitedSignature.s,
      splitedSignature.v,
    );

    const pendingController = await wallet.pendingController();
    expect(pendingController).to.equal(heirSigner.address);

    pendingControllerCommitBlock = await wallet.pendingControllerCommitBlock();
    expect(pendingControllerCommitBlock).to.equal(await ethers.provider.getBlockNumber());
  });

  it("Heir can't send any assets yet", async () => {
    let tokenId = 1;
    await checkCanNotSend(wallet, heirSigner, receiverSigner, amount, tokenId, tokenERC20, tokenERC721);
  });

  it("Heir can't finalize controller change yet", async () => {
    await expect(
      wallet.connect(heirSigner).finalizeControllerChange()
    ).to.be.revertedWith("Grace period has not passed yet");
  });

  it("Heir can finalize controller change after the grace period", async () => {
    await time.advanceBlockTo( pendingControllerCommitBlock.toNumber() + gracePeriodBlocks);
    await wallet.connect(heirSigner).finalizeControllerChange();

    const controller = await wallet.controller();
    expect(controller).to.equal(heirSigner.address);
  });

  it("Heir can send any assets", async () => {
    const tokenId = 1;
    await checkCanSend(wallet, heirSigner, receiverSigner, amount, tokenId, tokenERC20, tokenERC721);
  });

  it("Owner can't send any assets", async () => {
    const tokenId = 2;
    await checkCanNotSend(wallet, ownerSigner, receiverSigner, amount, tokenId, tokenERC20, tokenERC721);
  });
});
