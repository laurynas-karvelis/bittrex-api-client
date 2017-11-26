const BigNumber = require('bignumber.js'),
    _ = require('lodash');

BigNumber.config({ERRORS: false});

function transform(obj, bigNumberKeys, dateKeys) {
    return _.mapValues(obj, (val, key) => {
        if (_.includes(bigNumberKeys, key)) {
            if (_.isNumber(val)) val = new BigNumber(val);
        } else if (_.includes(dateKeys, key)) {
            if (_.isString(val)) val = new Date(val);
        }

        return val;
    });
}

const responseAdapters = {
    Balance: obj => {
        const numbers = ['Balance', 'Available', 'Pending'];
        return transform(obj, numbers);
    },

    BalanceList: list => _.map(list, responseAdapters.Balance),

    MarketList: list => {
        const numbers = ['MinTradeSize'];
        const dates = ['Created'];
        return _.map(list, obj => transform(obj, numbers, dates));
    },

    MarketSummary: obj => {
        const numbers = ['High', 'Low', 'Last', 'Bid', 'Ask', 'PrevDay'];
        const dates = ['TimeStamp', 'Created'];
        return transform(obj, numbers, dates);
    },

    MarketSummaryList: list => _.map(list, responseAdapters.MarketSummary),

    Order: obj => {
        const numbers = ['Limit', 'Quantity', 'QuantityRemaining', 'Commission', 'CommissionPaid', 'Price', 'PricePerUnit'];
        const dates = ['TimeStamp', 'Opened', 'Closed'];
        return transform(obj, numbers, dates);
    },

    OrderList: list => _.map(list, responseAdapters.Order),

    Ticker: obj => {
        const numbers = ['Bid', 'Ask', 'Last'];
        return transform(obj, numbers);
    },

    Candle: obj => {
        const numbers = ['H', 'L', 'O', 'C', 'BV', 'V'];
        const dates = ['T'];
        return transform(obj, numbers, dates);
    },

    OrderBook: obj => {
        const numbers = ['Quantity', 'Rate'];
        return _.mapValues(obj, list => _.map(list, obj => transform(obj, numbers)));
    },

    CandleList: list => _.map(list, responseAdapters.Candle),

    MarketHistory: list => {
        const numbers = ['Quantity', 'Price', 'Total'];
        const dates = ['TimeStamp'];
        return _.map(list, obj => transform(obj, numbers, dates));
    }
};

module.exports = responseAdapters;
