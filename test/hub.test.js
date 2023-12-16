    const { expect } = require("chai");
    const { ethers } = require("hardhat");
    const { utils } = require("ethers");

    describe("Hub Contract", function () {
    let Hub;
    let hubContract;
    let owner;
    let heir;
    let oracle;

    beforeEach(async function () {
        Hub = await ethers.getContractFactory("Hub");
        [owner, heir, oracle] = await ethers.getSigners();

        hubContract = await Hub.deploy();
        await hubContract.deployed();
    });

    // owner key registration testing
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
    
        await hubContract.connect(owner).registerPubKeyOracle(expectedPublicKey);
        const registeredPublicKey = await hubContract.registeredKeys(owner.address);
    
        expect(registeredPublicKey.toLowerCase()).to.equal(expectedPublicKey.toLowerCase());
    });

    it("should demand not to publish message", async function () {
        await hubContract.connect(heir).demandNotToPublish(heir.address);
        // Add assertions or checks as needed after this action
    });

    it("should publish message", async function () {
        const message = "Test message";

        await hubContract.connect(oracle).publish(heir.address, message);
        // Add assertions or checks as needed after this action
    });

    it("should send EIM to Oracle", async function () {
        const publicKey = "0x0123456789ABCDEF"; // Example public key
        await hubContract.connect(owner).registerPubKeyOwner(publicKey); // Register owner's public key
    
        const encryptedData = utils.toUtf8Bytes("0xencrypteddata");
        await hubContract.connect(owner).sendEIMtoOracle(encryptedData);
    
        // Add assertions or checks as needed after this action
    });

    //----------------------------
    it("should request EIM discover by Heir", async function () {
        const heirPublicKey = "0xABCDEF0123456789"; // Example public key by heir
    
        // Registering the public key Heir before the request
        await hubContract.connect(heir).registerPubKeyOwner(heirPublicKey);
    
        // EIM Discovery Request
        await hubContract.connect(heir).requestEIMDiscover();
    });

    it("should send EIM to Heir", async function () {
        const encryptedData = ethers.utils.toUtf8Bytes("0xencrypteddata"); // Example of encrypted data

        // Register the public key for the Oracle
        await hubContract.connect(oracle).registerPubKeyOracle("0x9876543210FEDCBA");

        // Execute the function after ensuring the Oracle's public key is registered
        await hubContract.connect(oracle).sendEIMtoHeir(heir.address, encryptedData);

        // Add assertions or checks as needed after this action
    });
    });
