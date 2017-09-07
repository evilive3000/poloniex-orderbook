Poloniex Orderbook
==================

[![npm](https://img.shields.io/npm/dm/@btcc_exchange/poloniex-orderbook.svg)](https://www.npmjs.com/package/@btcc_exchange/poloniex-orderbook)
[![GitHub tag](https://img.shields.io/github/tag/BTCChina/poloniex-orderbook.svg)](https://github.com/BTCChina/poloniex-orderbook)
[![GitHub stars](https://img.shields.io/github/stars/BTCChina/poloniex-orderbook.svg?style=social&label=Star)]()

### !!! Read it !!!
> Since August 2017 Poloniex added anti-bot protection for their site and websocket connection which were used 
in this library. If you want to go on with `poloniex-orderbook` you will have to do extra workaround to make it 
work. Otherwise you're left with another option is to use official poloniex api (which I'm not support here).

Module for creating and maintaining Poloniex's orderbook on server side.
 * From `v3.0` I switched from pushAPI to WebScoket based API, it's made intaraction with `poloniex` much faster.
 * From `v3.2` we have to deal with Poloniex's anti-bot protection. Or refuse to use this lib and return to official API.

Installation
------------------
```Shell
$ npm install @btcc_exchange/poloniex-orderbook
```

## docs

Please see [https://github.com/evilive3000/poloniex-orderbook](https://github.com/evilive3000/poloniex-orderbook)