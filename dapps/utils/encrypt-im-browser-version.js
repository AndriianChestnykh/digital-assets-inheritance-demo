// const compressKey = require('./compress-key.js');

const compressKey = require('./compress-key-browser-version.js');
const sodium = require('sodium-universal');
const CryptoJS = require('crypto-js');
const cryptoConfigConstant = require('./crypto-config-constant.js');

async function encryptIM(message, senderPrivateKey, recipientPublicKey) {
    return new Promise((resolve, reject) => {
        try {
            if (typeof message === 'object') {
                message = JSON.stringify(message);
            }

            const shortPrivateKeySender = compressKey(senderPrivateKey);
            const shortPublicKeyRecipient = compressKey(recipientPublicKey);

            const senderSharedSecret = new Uint8Array(sodium.crypto_scalarmult_BYTES);

            sodium.crypto_scalarmult_base

            sodium.crypto_scalarmult(senderSharedSecret, shortPrivateKeySender, shortPublicKeyRecipient);

            const senderSharedSecretHex = Array.prototype.map.call(senderSharedSecret, x => ('00' + x.toString(16)).slice(-2)).join('');

            const iv = new Uint8Array(cryptoConfigConstant.ivBytes).fill(0);
            
            const counter = CryptoJS.lib.WordArray.create('d8d8dae8405c447d86e84be03b71327b');

            const encrypted = CryptoJS.AES.encrypt(message, senderSharedSecretHex, {
                iv: iv,
                mode: CryptoJS.mode.CTR,
                counter: counter
            })

            resolve (encrypted.toString());
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = encryptIM;
