const crypto = require('crypto');

class Signature {
    constructor(algorithm, key, secret) {
        this.algorithm = algorithm;
        this._key = key;
        this._secret = secret;
    }

    get key() {
        return this._key;
    }

    sign(data) {
        return crypto.createHmac(this.algorithm, this._secret).update(data).digest('hex');
    }

    verify(signedData, data) {
        return signedData === this.sign(this.algorithm, this._secret, data);
    }
}

module.exports = Signature;
