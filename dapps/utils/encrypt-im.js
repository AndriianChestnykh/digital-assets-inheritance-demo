const compressKey = require("./compress-key.js");
const sodium = require('sodium').api;
const crypto = require('crypto');
const cryptoConfigConstant = require("./crypto-config-constant.js");

const targetMessage = "Hello, World!"

const accounts = {
    Owner: {
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        publicKey: Buffer.from('0x04682c3ea377dafe9e4eb735af60c4edf2e581d529cc69816e768432a8aa09178470c9b1e703951f4a85e0dab7d8008e2a9e9e1794b0cfc6d430bc4aace3ad3e2', 'hex'),
        privateKey: Buffer.from('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', 'hex')
    },
    Heir: {
        address: "x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        publicKey: Buffer.from('0x0406626fc5130be23a0e58c6d24e148a3e6cefd676162f4c176822aa885e6c2eb15a1657e3a4a865b516e7bf2288bfcb6d32cd7ecdc0f058b5bf84d28a5d9d2b2', 'hex'),
        privateKey: Buffer.from('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', 'hex'),
    },
    Oracle: {
        address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        publicKey: Buffer.from('0x0473a0b62325c802d13e0845e44a8199c91809a6df8a5be2f10c5270784b6db32de05b9818c92921488365ff6ba7258e72bc1e4aa05a6a8929787ba6cf0ddfb2b', 'hex'),
        privateKey: Buffer.from('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', 'hex'),
    }
}

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

encryptIM(targetMessage, accounts.Owner.privateKey, accounts.Heir.publicKey)
    .then((result) => {
        console.log("Result encryp function Promise:", result);
    })
    .catch((error) => {
        console.error("Encryption error:", error);
    });

module.exports = encryptIM;
