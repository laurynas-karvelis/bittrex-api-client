const _ = require('lodash');

const config = {
    BASE_URI: 'https://bittrex.com/api/v1.1',
    BASE_V2_URI: 'https://bittrex.com/Api/v2.0',
    useResponseAdapters: true,
    request: {
        userAgent: 'bittrex-api-client',
        rateLimit: 250, // 500ms rate limit per request in the request queue
        maxRetries: 3,  // 3 max retries per failed request,
        options: {
            // npm request options, ie. proxy settings,
            timeout: 10000, // 10sec
            forever: true,  // keepAlive
        }
    }
};

module.exports = {
    config,
    configure(configOverride = {}) {
        _.merge(config, configOverride);
    }
};
