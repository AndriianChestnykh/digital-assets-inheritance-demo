const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils } = require("ethers");
// const encryptIM = require("./../dapps/utils/encrypt-im.js");
// const decryptIM = require("./../dapps/utils/decrypt-im.js");

const encryptIM = require("./../dapps/utils/encrypt-im-browser-version.js");
const decryptIM = require("./../dapps/utils/decrypt-im-browser-version.js");
const sodium = require("sodium-universal");

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

describe("Encryption and Decryption", function () {
    before(() => {
        //TODO move to other file

        const toHexString = (bytes) =>
          bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

        const ownerPubKey = new Uint8Array(sodium.crypto_scalarmult_BYTES);
        const ownerPrivKeyBuff = Uint8Array.from(accounts.Owner.privateKey.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
        sodium.crypto_scalarmult_base(ownerPubKey, ownerPrivKeyBuff)
        const ownerPubKeyHex = toHexString(Uint8Array.from(ownerPubKey));

        const heirPubKey = new Uint8Array(sodium.crypto_scalarmult_BYTES);
        const heirPrivKeyBuff = Uint8Array.from(accounts.Heir.privateKey.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
        sodium.crypto_scalarmult_base(heirPubKey, heirPrivKeyBuff)
        const heirPubKeyHex = toHexString(Uint8Array.from(heirPubKey));
        console.log("s")

        const oraclePubKey = new Uint8Array(sodium.crypto_scalarmult_BYTES);
        const oraclePrivKeyBuff = Uint8Array.from(accounts.Oracle.privateKey.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
        sodium.crypto_scalarmult_base(oraclePubKey, oraclePrivKeyBuff)
        const oraclePubKeyHex = toHexString(Uint8Array.from(oraclePubKey));

        console.log("OwnerPubKey: ", ownerPubKeyHex);
        console.log("HeirPubKey: ", heirPubKeyHex);
        console.log("OraclePubKey: ", oraclePubKeyHex);
    });

    it("should encrypt and decrypt the message (new functions)", async function () {
        const message = "Hello, world!";

        // Encrypting a message from Owner to Heir
        const encryptedMessage = await encryptIM(message, accounts.Owner.privateKey, accounts.Heir.publicKey);
        console.log("encryptedMessage:", encryptedMessage)
        // Decrypt the message
        const decryptedMessage = await decryptIM(encryptedMessage, accounts.Heir.privateKey, accounts.Owner.publicKey);
        console.log("decryptedMessage:", decryptedMessage)
        // Check if the decrypted message matches the original message
        expect(decryptedMessage).to.equal(message);
    });

    it("should encrypt the message, send it to Oracle, Oracle should decrypt it", async function () {
        const message = "Hello, world!";

        // Encrypting a message from Owner to Heir
        const encryptedMessage = await encryptIM(message, accounts.Owner.privateKey, accounts.Heir.publicKey);

        // Owner encrypting message for Oracle and send it
        const encryptedMessageForOracle = await encryptIM(encryptedMessage, accounts.Owner.privateKey, accounts.Oracle.publicKey);

        // Oracle gets encrypted message from Owner and decrypted it
        const decryptedMessageFromOwnerToOracle = await decryptIM(encryptedMessageForOracle, accounts.Oracle.privateKey, accounts.Owner.publicKey)

        expect(decryptedMessageFromOwnerToOracle).to.equal(encryptedMessage)
    })

    it("create new account using ether.js and private key", async function () {
        const message = "Hello, world!";

        // Encrypting a message from Owner to Heir
        const encryptedMessage = await encryptIM(message, accounts.Owner.privateKey, accounts.Heir.publicKey);

        // Owner encrypting message for Oracle and send it
        const encryptedMessageForOracle = await encryptIM(encryptedMessage, accounts.Owner.privateKey, accounts.Oracle.publicKey);

        // Oracle gets encrypted message from Owner and decrypted it
        const decryptedMessageFromOwnerToOracle = await decryptIM(encryptedMessageForOracle, accounts.Oracle.privateKey, accounts.Owner.publicKey)

        // Heir gets encrypt message from Oracle
        const decryptedMessageFromOwnetToHeir = await decryptIM(decryptedMessageFromOwnerToOracle, accounts.Heir.privateKey, accounts.Owner.publicKey)

        expect(decryptedMessageFromOwnetToHeir).to.equal(message)
    })
});
