const querystring = require('querystring'),
    _ = require('lodash'),
    request = require('request-promise'),
    RateLimiter = require('limiter').RateLimiter,
    promiseRetry = require('promise-retry'),
    config = require('./config').config;

let nonce = null;

class Transport {
    constructor(signature) {
        this.nonce = new Date() * 1;
        this.limiter = new RateLimiter(1, config.request.rateLimit);

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
        return promiseRetry((retry, retryIteration) => {
            return request(requestOptions)
                .then(response => {
                    if (_.get(response, 'success', false)) return response.result;
                    else throw new Error(response.message);
                })
                .catch(e => {
                    if (retryIteration <= this.maxRetries) return retry();
                    throw e;
                });
        });
    }
}

module.exports = Transport;
