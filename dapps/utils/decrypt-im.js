// const compressKey = require('./compress-key.js');
// const sodium = require('sodium').api;
// const crypto = require('crypto');
// const cryptoConfigConstant = require("./crypto-config-constant.js");

// async function decryptIM(encryptedMessage, recipientPrivateKey, senderPublicKey) {
//     return new Promise((resolve, reject) => {
//         try {
//             const shortRecipientPrivateKey = compressKey(recipientPrivateKey);
//             const shortSenderPublicKey = compressKey(senderPublicKey);
//             const recipientSharedSecret = sodium.crypto_scalarmult(shortRecipientPrivateKey, shortSenderPublicKey);
        
//             const iv = Buffer.alloc(cryptoConfigConstant.ivBytes, 0);
//             const decipher = crypto.createDecipheriv(cryptoConfigConstant.cipher, recipientSharedSecret, iv);
        
//             let decrypted = '';
        
//             decipher.on('readable', () => {
//                 let chunk = '';
//                 while (null !== (chunk = decipher.read())) {
//                     decrypted += chunk.toString('utf8');
//                 }
//             });
        
//             decipher.on('end', () => {
//                 resolve(decrypted);
//             });
        
//             decipher.on('error', (error) => {
//                 reject(error);
//             });
        
//             decipher.write(encryptedMessage, 'hex');
//             decipher.end();
//         } catch (error) {
//             reject(error);
//         }
//     });
// }

// module.exports = decryptIM;
