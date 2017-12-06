const _ = require('lodash'),
    Transport = require('./transport'),
    Signature = require('./signature'),
    responseAdapters = require('./response-adapters'),
    config = require('./config').config;

class PrivateApi {
    constructor(key, secret) {
        this.signature = new Signature('sha512', key, secret);
        this.transport = new Transport(this.signature);

        this.CANDLE_TYPES = {
            ONE_MIN: 'oneMin',
            FIVE_MIN: 'fiveMin',
            THIRTY_MIN: 'thirtyMin',
            HOURLY: 'hour',
            DAILY: 'day'
        };
    }

    _request(uri, params = {}, baseUri = config.BASE_URI) {
        const requestOptions = this.transport.getRequestOptions(baseUri, uri, params, this.signature);
        return this.transport.request(requestOptions);
    }

    /**
     * !!! IMPORTANT: it is *HIGHLY* recommended to create a separate instance of PrivateApi
     * !!! for this call with completely different API key/secret
     * !!! Otherwise you might get random INVALID_SIGNATURE errors in this and/or other subsequent requests
     */
    getCandles(market, tickInterval = this.CANDLE_TYPES.THIRTY_MIN, candleLimit = 0) {
        const promise = this._request('pub/market/GetTicks', {marketName: market, tickInterval}, config.BASE_V2_URI)
            .then(candles => candleLimit ? _.takeRight(candles, candleLimit) : candles);

        return config.useResponseAdapters ? promise.then(responseAdapters.CandleList) : promise;
    }

    getBalances() {
        const promise = this._request('account/getbalances');
        return config.useResponseAdapters ? promise.then(responseAdapters.BalanceList) : promise;
    }

    getBalance(currency) {
        const promise = this._request('account/getbalance', {currency});
        return config.useResponseAdapters ? promise.then(responseAdapters.Balance) : promise;
    }

    getDepositAddress(currency) {
        return this._request('account/getdepositaddress', {currency});
    }

    withdraw(currency, quantity, address, paymentId = '') {
        return this._request('account/withdraw', {
            currency,
            quantity,
            address,
            paymentId,
        });
    }

    getOrder(uuid) {
        const promise = this._request('account/getorder', {uuid});
        return config.useResponseAdapters ? promise.then(responseAdapters.Order) : promise;
    }

    getOrderHistory() {
        const promise = this._request('account/getorderhistory');
        return config.useResponseAdapters ? promise.then(responseAdapters.OrderList) : promise;
    }

    getWithdrawalHistory() {
        return this._request('account/getwithdrawalhistory')
    }

    getDepositHistory() {
        return this._request('account/getdeposithistory')
    }

    buyLimit(market, quantity, rate) {
        return this._request('market/buylimit', {market, quantity, rate})
            .then(order => order.uuid);
    }

    buyMarket(market, quantity) {
        return this._request('market/buymarket', {market, quantity})
            .then(order => order.uuid);
    }

    sellLimit(market, quantity, rate) {
        return this._request('market/selllimit', {market, quantity, rate})
            .then(order => order.uuid);
    }

    sellMarket(market, quantity) {
        return this._request('market/sellmarket', {market, quantity})
            .then(order => order.uuid);
    }

    cancelOrder(uuid) {
        return this._request('market/cancel', {uuid});
    }

    getOpenOrders() {
        const promise = this._request('market/getopenorders');
        return config.useResponseAdapters ? promise.then(responseAdapters.OrderList) : promise;
    }
}

module.exports = PrivateApi;
