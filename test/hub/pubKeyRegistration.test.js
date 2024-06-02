const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils } = require("ethers");

describe("Hub Contract", function () {
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
        

        //TODO register public key for owner, heir, oracle

        it("should register public key for owner", async function () {
            const expectedPublicKey = "0x0123456789ABCDEF"; // Expected public key value by owner
    
            await hubContract.connect(owner).registerPubKeyOwner(expectedPublicKey);
            const registeredPublicKey = await hubContract.registeredKeys(owner.address);
    
    
            const expectedKeyLower = expectedPublicKey.toLowerCase();
            const actualKeyLower = registeredPublicKey.toLowerCase();
    
            expect(actualKeyLower).to.equal(expectedKeyLower);
        });
    
        // heir key registration testing
        it("should register public key for heir", async function () {
            const expectedPublicKey = "0xABCDEF0123456789"; // Expected public key value by heir
    
            await hubContract.connect(owner).registerPubKeyHeir(heir.address, expectedPublicKey);
            const registeredPublicKey = await hubContract.registeredKeys(heir.address);
    
            const expectedKeyLower = expectedPublicKey.toLowerCase();
            const actualKeyLower = registeredPublicKey.toLowerCase();
    
            expect(actualKeyLower).to.equal(expectedKeyLower);
        });
    
        //oracle key registration testing
        it("should register public key for oracle", async function () {
            const expectedPublicKey = "0x9876543210FEDCBA"; // Expected public key value by oracle
    
            await hubContract.connect(owner).registerPubKeyOracle(oracle.address, expectedPublicKey);
            const registeredPublicKey = await hubContract.registeredKeys(oracle.address);
    
            expect(registeredPublicKey.toLowerCase()).to.equal(expectedPublicKey.toLowerCase());
        });
})