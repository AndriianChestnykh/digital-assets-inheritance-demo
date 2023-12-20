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

        //TODO register public key for owner, heir, oracle
    });

    // -------------- START: TODO consider moving this to a separate file----------------

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
        // ----------- END: TODO consider moving this to a separate file-------------------

    //0.1 Owner gets Heir public key
    //0.2 Owner generates IM
    //1. Owner encrypts (DH with Owner + Heir): DH_O_H(IM) - EIM
    //2. Owner gets Oracle public key
    //3. Owner encrypts (DH with Owner + Oracle): DH_O_Or(DH_O_H(IM)) - EIM
    //2. Owner sends DH_O_Or(DH_O_H(IM)) to Oracle
    //3. Oracle waits
    //4. Heir asks to discover
    // 4.1 Oracle gets the Heir discovery request
    //5. Oracle decrypts DH_O_Or(DH_O_H(IM)) and sends DH_O_H(IM) to Heir
    //6. Heir decrypts DH_O_H(IM) and g`ets IM

    it("should send EIM to Oracle", async function () {
        // TODO //0.1 Owner gets Heir public key
        // //0.2 Owner generates IM
        // //1. Owner encrypts (DH with Owner + Heir): DH_O_H(IM) - EIM
        // //2. Owner gets Oracle public key
        // //3. Owner encrypts (DH with Owner + Oracle): DH_O_Or(DH_O_H(IM)) - EIM

        const publicKey = "0x0123456789ABCDEF"; // Example public key
        await hubContract.connect(owner).registerPubKeyOwner(publicKey); // Register owner's public key

        const heirAddress = heir.address;
        const encryptedData = utils.toUtf8Bytes("0xencrypteddata");
        await hubContract.connect(owner).sendEIMtoOracle(heirAddress, encryptedData);
    });

    //----------------------------
    it("should request EIM discover by Heir", async function () {
        const heirPublicKey = "0xABCDEF0123456789"; // Example public key by heir

        // Registering the public key Heir before the request
        await hubContract.connect(heir).registerPubKeyOwner(heirPublicKey);

        //4. Heir asks to discover
        // check event is raised
        await expect(hubContract.connect(heir).requestEIMDiscover())
            .to.emit(hubContract, "EIMRequestedByHeir")
            .withArgs(heir.address);
    });

    it("should send EIM to Heir", async function () {
        const filter = hubContract.filters.EIMRequestedByHeir(null);
        const logs = await hubContract.queryFilter(filter, 0, "latest");
        logs.map(async function (log) {
            //TODO: // 4.1 Oracle gets the Heir discovery request
            // //5. Oracle decrypts DH_O_Or(DH_O_H(IM)) and sends DH_O_H(IM) to Heir via sendEIMtoHeir()
            console.log("log.args: ", log.args);

            const encryptedData = ethers.utils.toUtf8Bytes("0xencrypteddata"); // Example of encrypted data

            // Register the public key for the Oracle
            await hubContract.connect(oracle).registerPubKeyOracle("0x9876543210FEDCBA");

            // Execute the function after ensuring the Oracle's public key is registered
            await hubContract.connect(oracle).sendEIMtoHeir(heir.address, encryptedData);

            // Add assertions or checks as needed after this action
        });
        });

        // TODO //6. Heir decrypts DH_O_H(IM) and gets IM. Check if the IM is correct.
        //const filter ...
    });
