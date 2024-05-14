const crypto = require('crypto');

function compressKey(key) {
    const hash = crypto.createHash('sha256').update(key).digest();
    const changedSizeKey = hash.toString('hex').slice(0, 64);
    return Buffer.from(changedSizeKey, 'hex');
}

module.exports = compressKey;