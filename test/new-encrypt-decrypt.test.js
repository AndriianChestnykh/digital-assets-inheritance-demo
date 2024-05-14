const { expect } = require("chai");
const { ethers } = require("hardhat");

const encryptIM = require("./../dapps/utils/encrypt-im-browser-version.js");
const decryptIM = require("./../dapps/utils/decrypt-im-browser-version.js");

describe("New encryption and decryption", function () {
    let Hub;
    let hubContract;
    let owner;
    let heir;
    let oracle;

    before(async function () {
        Hub = await ethers.getContractFactory("Hub");
        [owner, heir, oracle] = await ethers.getSigners();
        ethers.ge

        hubContract = await Hub.deploy();
        await hubContract.deployed();
    });

    const accounts = {
        Owner: {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            publicKey: '9adac7a7558764cf6bc45d88968b7d1e27b95e641c2827fba034350e91a44d22',
            privateKey: 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        },
        Heir: {
            address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            publicKey: '107302eea84f3f75c50184df4102862bf50f6fbcee88bf9d7d33852ab90f302d',
            privateKey: '59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
        },
        Oracle: {
            address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            publicKey: '9a09fdb91965386b6705c734ed36c3265144967b823e23a1b665ae8be922683c',
            privateKey: '5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
        }
    }

    it("should register public keys for owner, heir, and oracle", async function () {
        const ownerPublicKey = '0x' + accounts.Owner.publicKey;
        const heirPublicKey = '0x' + accounts.Heir.publicKey;
        const oraclePublicKey = '0x' + accounts.Oracle.publicKey;

        const message = "Hello world!";
    
        await hubContract.connect(owner).registerPubKeyOwner(ownerPublicKey);
        await hubContract.connect(owner).registerPubKeyHeir(heir.address, heirPublicKey);
        await hubContract.connect(owner).registerPubKeyOracle(oracle.address, oraclePublicKey);
       
        const contractPublicKeyOwner = await hubContract.getPubKey(owner.address);
        const contractPublicKeyHeir = await hubContract.getPubKey(heir.address);
        const contractPublicKeyOracle = await hubContract.getPubKey(oracle.address);

        const encryptedMessage = await encryptIM(message, accounts.Owner.privateKey, contractPublicKeyHeir);
        console.log("encryptedMessage:", encryptedMessage)

        const decryptedMessage = await decryptIM(encryptedMessage, accounts.Heir.privateKey, contractPublicKeyOwner);
        console.log("decryptedMessage:", decryptedMessage)

        expect(decryptedMessage).to.equal(message);
    });
})