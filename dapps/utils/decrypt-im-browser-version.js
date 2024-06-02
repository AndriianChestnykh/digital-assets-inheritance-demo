const sodium = require('sodium-universal');
const CryptoJS = require('crypto-js');
const cryptoConfigConstant = require('./crypto-config-constant.js');

async function decryptIM(encryptedMessage, recipientPrivateKey, senderPublicKey) {
    return new Promise((resolve, reject) => {
        try {
            if (recipientPrivateKey.startsWith("0x")) {
                recipientPrivateKey = recipientPrivateKey.substring(2);
            }

            if (senderPublicKey.startsWith("0x")) {
                senderPublicKey = senderPublicKey.substring(2);
            }

            const privKeyBuf = Uint8Array.from(recipientPrivateKey.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
            const pubKeyBuf = Uint8Array.from(senderPublicKey.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

            const sharedSecret = new Uint8Array(sodium.crypto_scalarmult_BYTES);
            sodium.crypto_scalarmult(sharedSecret, privKeyBuf, pubKeyBuf);

            const recipientSharedSecretHex = Array.prototype.map.call(sharedSecret, x => ('00' + x.toString(16)).slice(-2)).join('');
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
