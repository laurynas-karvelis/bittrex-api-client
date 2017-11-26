# bittrex-api-client
Bittrex.com REST client with socket support for live orderbook done right

## Synopsis

This project aims to deliver a small, simple, pure Javascript ES6 module that allows full complete interaction with
Bittrex.com API. This module delivers REST interface along with socket implementation that enables users to observe
order fills and orderbooks for individual markets realtime. Socket implementation is just and exposed 3rd party
``bittrex-market`` module.

Following features:
* REST Transport is built on top of ``request-promise``
* Bluebird promise based
* Supports request retries out-of-the-box
* Uses request queue limiter
* REST API responses are being run through response adapters
..* Converts most numbers into BigNumber instances for precision maths
..* Converts dates and timestamps to Date instances
* Configurable

## Code Example

Example usage of this module:
```javascript 1.6
const {configure, PublicApi, PrivateApi} = require('bittrex-api-client');

// override default module configuration before initializing API instances
configure({
    useResponseAdapters: false, // turn off response adaptors
    request: {
        maxRetries: 5,
        options: {
            forever: false
        }
    }
});

const publicApi = new PublicApi();
const privateApi = new PrivateApi('your key', 'your api secret');
const candlePrivateApi = new PrivateApi('another key', 'another secret');

// get Bittrex.com tradeable currencies 
publicApi.getCurrencies()
    .then(console.log)
    .catch(console.error);

// get Bitcoin balance in your account wallet
privateApi.getBalance('BTC')
    .then(console.log)
    .catch(console.error);

// get hourly candles for BTC-NEO market and trim returned array to the last 50 candles
// IMPORTANT: it is highly advisable to create a separate API key pair for PrivateApi when fetching candle list
// Apparently mixing v1.1 and v2.0 API calls using same API keys Bittrex returns INVALID_SIGNATURE errors
candlePrivateApi.getCandles('BTC-NEO', privateApi.CANDLE_TYPES.HOURLY, 50)
    .then(console.log)
    .catch(console.error);
```

## Motivation

After failing to find a complete and elegant module that includes sockets, promises I came up with this by borrowing ideas from other Bittrex.com API modules out there.

## Installation

To install this module using yarn package manager invoke the following line in your project's working directory.
```
$ yarn add bittrex-api-client
```

## Tests

Currently there are no tests, but pull requests are always welcome.

## License

MIT license. As in, do what you want, use it where you want.

