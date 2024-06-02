const cryptoConfigConstant = {
    // Symmetric cipher for private key encryption
    cipher: "aes-256-ctr",
  
    // Initialization vector size in bytes
    ivBytes: 16,
  
    // ECDSA private key size in bytes
    keyBytes: 32,
  
    // Key derivation function parameters
    scrypt: {
        memory: 280000000,
        dklen: 54,
        n: 262144,
        r: 8,
        p: 1
    }
};

module.exports = cryptoConfigConstant;
