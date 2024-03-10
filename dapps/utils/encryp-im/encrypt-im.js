const compressKey = require("./../compress-key/compress-key.js");
const sodium = require('sodium').api;
const crypto = require('crypto');
const cryptoConfigConstant = require("./../crypto-config-constant.js");

async function encryptIM(message, senderPrivateKey, recipientPublicKey) {
    return new Promise((resolve, reject) => {
        try {
            const shortPrivateKeySender = compressKey(senderPrivateKey);
            const shortPublicKeyRecipient = compressKey(recipientPublicKey);
            
            const senderSharedSecret = sodium.crypto_scalarmult(shortPrivateKeySender, shortPublicKeyRecipient);
        
            const iv = Buffer.alloc(cryptoConfigConstant.ivBytes, 0);
        
            const cipher = crypto.createCipheriv(cryptoConfigConstant.cipher, senderSharedSecret, iv);
        
            let encrypted = '';
        
            cipher.on('readable', () => {
                let chunk = '';
                while (null !== (chunk = cipher.read())) {
                    encrypted += chunk.toString('hex');
                }
            });
        
            cipher.on('end', () => {
                resolve(encrypted);
            });
        
            cipher.on('error', (error) => {
                reject(error);
            });
        
            cipher.write(message, 'utf8');
            cipher.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = encryptIM;
