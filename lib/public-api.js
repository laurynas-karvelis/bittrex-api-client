const _ = require('lodash'),
    Transport = require('./transport'),
    responseAdapters = require('./response-adapters'),
    config = require('./config').config;

class PublicApi {
    constructor() {
        this.transport = new Transport();
    }

    _request(uri, params = {}, baseUri = config.BASE_URI) {
        const requestOptions = this.transport.getRequestOptions(baseUri, uri, params);
        return this.transport.request(requestOptions);
    }

    getMarkets() {
        const promise = this._request('public/getmarkets');
        return config.useResponseAdapters ? promise.then(responseAdapters.MarketList) : promise;
    }

    getCurrencies() {
        return this._request('public/getcurrencies');
    }

    getTicker(market) {
        const promise = this._request('public/getticker', {market});
        return config.useResponseAdapters ? promise.then(responseAdapters.Ticker) : promise;
    }

    getMarketSummaries() {
        const promise = this._request('public/getmarketsummaries');
        return config.useResponseAdapters ? promise.then(responseAdapters.MarketSummaryList) : promise;
    }

    getMarketSummary(market) {
        const promise = this._request('public/getmarketsummary', {market}).then(_.first);
        return config.useResponseAdapters ? promise.then(responseAdapters.MarketSummary) : promise;
    }

    getOrderBook(market, depth = null, type = 'both') {
        const returnsMap = type === 'both';
        let promise = this._request('public/getorderbook', {market, depth, type});

        if (_.isFinite(depth)) {
            promise = returnsMap
                ? promise.then(map => _.mapValues(map, list => _.take(list, depth)))
                : promise.then(list => _.take(list, depth));
        }

        if (config.useResponseAdapters) {
            const adapter = returnsMap ? responseAdapters.OrderBookBothTypes : responseAdapters.OrderBook;
            return promise.then(adapter);
        }

        return promise;
    }

    getMarketHistory(market, count = 20) {
        const promise = this._request('public/getmarkethistory', {market, count});
        return config.useResponseAdapters ? promise.then(responseAdapters.MarketHistory) : promise;
    }

}

module.exports = PublicApi;
