const querystring = require('querystring'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    request = require('request-promise'),
    RateLimiter = require('limiter').RateLimiter,
    retry = require('retry'),
    config = require('./config').config;

const limiter = new RateLimiter(1, config.request.rateLimit);
let nonce = null;

class Transport {
    constructor(signature) {
        this.signature = signature;
        this.userAgent = config.request.userAgent;
        this.maxRetries = config.request.maxRetries;
        this.requestOptions = config.request.options;
    }

    _getHeader(url) {
        const header = {'User-Agent': this.userAgent};
        this.signature && (header.apisign = this.signature.sign(url));

        return header;
    }

    getRequestOptions(baseUri, uri, params = {}) {
        const qs = _.extend({}, params, {nonce: nonce ? nonce++ : new Date() * 1});
        this.signature && _.extend(qs, {apikey: this.signature.key});

        const url = `${baseUri}/${uri}?${querystring.stringify(qs)}`;

        return _.merge({}, this.requestOptions, {
            url,
            method: 'GET',
            headers: this._getHeader(url),
            json: true
        });
    }

    request(requestOptions) {
        const operation = retry.operation({retries: this.maxRetries});

        return new Promise((resolve, reject) => {
            operation.attempt(currentAttempt => {
                limiter.removeTokens(1, () => {
                    request(requestOptions)
                        .then(body => {
                            if (_.get(body, 'success')) return resolve(body.result);
                            if (operation.retry(new Error(body.message))) return;
                            reject(new Error(body.message));
                        })
                        .catch(err => {
                            if (operation.retry(err)) return;
                            reject(err);
                        });
                });
            });
        });
    }
}

module.exports = Transport;
