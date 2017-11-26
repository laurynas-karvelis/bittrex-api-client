const
    restConfig = require('./lib/config'),
    PublicApi = require('./lib/public-api'),
    PrivateApi = require('./lib/private-api'),
    SocketApi = require('bittrex-market'),
    BigNumber = require('bignumber.js');

module.exports = {
    configure: restConfig.configure,
    PublicApi,
    PrivateApi,
    SocketApi,
    BigNumber
};
