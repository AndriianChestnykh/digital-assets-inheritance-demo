// const { expect } = require("chai");
// const {ethers} = require("hardhat");
// const encryptIM = require("./../dapps/utils/encrypt-im.js");
// const decryptIM = require("./../dapps/utils/decrypt-im.js");
// const { describe } = require("mocha");


// describe("New encrypr decrypt tests functions", function() {
//     let Hub;
//     let hubContract;
//     let owner;
//     let heir;
//     let oracle;

//     before(async function() {
//         Hub = await ethers.getContractFactory("Hub");
//         [owner, heir, oracle] = await ethers.getSigners();
//         ethers.ge

//         hubContract = await Hub.deploy();
//         await hubContract.deployed();
//     })

//     it("should encrypt and decrypt the message in Hub Smart Contract", async function() {
//         const ownerPublicKey = await owner.getPublicKey();

//         await hubContract.connect(owner).registerPubKeyOwner(ownerPublicKey);
//         const registerPubKeyHeirByOwner = await hubContract.registeredKeys(owner.address);

//         expect(registerPubKeyHeirByOwner).to.equal(ownerPublicKey);
//     })
// })