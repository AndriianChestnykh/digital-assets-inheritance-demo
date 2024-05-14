// const compressKey = require('./compress-key.js');

const compressKey = require('./compress-key-browser-version.js');
const sodium = require('sodium-universal');
const CryptoJS = require('crypto-js');
const cryptoConfigConstant = require('./crypto-config-constant.js');

async function decryptIM(encryptedMessage, recipientPrivateKey, senderPublicKey) {
    return new Promise((resolve, reject) => {
        try {
            const shortPrivateKeyRecipient = compressKey(recipientPrivateKey);
            const shortPublicKeySender = compressKey(senderPublicKey);

            const recipientSharedSecret = new Uint8Array(sodium.crypto_scalarmult_BYTES);
            sodium.crypto_scalarmult(recipientSharedSecret, shortPrivateKeyRecipient, shortPublicKeySender);

            const recipientSharedSecretHex = Array.prototype.map.call(recipientSharedSecret, x => ('00' + x.toString(16)).slice(-2)).join('');

            const iv = new Uint8Array(cryptoConfigConstant.ivBytes).fill(0);

            const counter = CryptoJS.lib.WordArray.create('d8d8dae8405c447d86e84be03b71327b');

            const decrypted = CryptoJS.AES.decrypt(encryptedMessage, recipientSharedSecretHex, {
                iv: iv,
                mode: CryptoJS.mode.CTR,
                counter: counter
            });

            resolve(decrypted.toString(CryptoJS.enc.Utf8));
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = decryptIM;
