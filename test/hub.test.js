const { expect } = require("chai");
const { ethers } = require("hardhat");

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

  it("should register public key for owner", async function () {
    const publicKey = "0x0123456789ABCDEF"; // Exapmle data of public key by owner

    await hubContract.connect(owner).registerPubKeyOwner(publicKey);
    const registeredPublicKey = await hubContract.registeredKeys(owner.address);

    expect(registeredPublicKey).to.equal(publicKey);
  });

  it("should register public key for heir", async function () {
    const publicKey = "0xABCDEF0123456789"; // Exapmle data of public key by heir

    await hubContract.connect(owner).registerPubKeyHeir(heir.address, publicKey);
    const registeredPublicKey = await hubContract.registeredKeys(heir.address);

    expect(registeredPublicKey).to.equal(publicKey);
  });

  it("should register public key for oracle", async function () {
    const publicKey = "0x9876543210FEDCBA"; // Exapmle data of public key by oracle

    await hubContract.connect(owner).registerPubKeyOracle(publicKey);
    const registeredPublicKey = await hubContract.registeredKeys(owner.address);

    expect(registeredPublicKey).to.equal(publicKey);
  });

  it("should request message to publish", async function () {
    await hubContract.connect(heir).requestToPublish();
    const request = await hubContract.requests(heir.address);

    expect(request.requested).to.equal(true);
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
    const encryptedData = "0xencrypteddata"; // Example of encrypted data

    await hubContract.connect(owner).sendEIMtoOracle(encryptedData);
    // Add assertions or checks as needed after this action
  });

  it("should request EIM discover by Heir", async function () {
    await hubContract.connect(heir).requestEIMDiscover();
    // Add assertions or checks as needed after this action
  });

  it("should send EIM to Heir", async function () {
    const encryptedData = "0xencrypteddata"; // Example of encrypted data

    await hubContract.connect(oracle).sendEIMtoHeir(heir.address, encryptedData);
    // Add assertions or checks as needed after this action
  });
});
