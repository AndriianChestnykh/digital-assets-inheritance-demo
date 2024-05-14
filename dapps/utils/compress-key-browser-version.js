const CryptoJS = require('crypto-js');

function compressKey(key) {
    const hash = CryptoJS.SHA256(key);
    const changedSizeKey = hash.toString(CryptoJS.enc.Hex).slice(0, 64);
    const byteArray = new Uint8Array(changedSizeKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return byteArray;
}

module.exports = compressKey;
