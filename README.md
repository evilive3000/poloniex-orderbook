Poloniex Orderbook
==================

[![npm](https://img.shields.io/npm/dm/poloniex-orderbook.svg)](https://www.npmjs.com/package/poloniex-orderbook)
[![GitHub tag](https://img.shields.io/github/tag/evilive3000/poloniex-orderbook.svg)](https://github.com/evilive3000/poloniex-orderbook)
[![GitHub stars](https://img.shields.io/github/stars/evilive3000/poloniex-orderbook.svg?style=social&label=Star)]()

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
$ npm install poloniex-orderbook
```

Usage
-----
Requires nodejs => 6.0

Create file `headers.json` and fill it with your `User-Agent` and `cf_clearance` cookie.
You should grab this information from your browser. 
```json
{
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36",
  "Cookie": "cf_clearance=7332b18714d3aa45aed82424e50cf166d6093c6f-1501832791-1800"
}
```
> As I can suggest this cookie gives you a window in 30 minutes to connects. It's mean you can coonect many times 
in this time frame, then you have to renew cookie. When ws-connection is set up you can stop worrying about 
renewing because websocket sends cookies only on connection, so I hope it will last until you decide to reconnect.
 Yes, it's very inconvenient, but that's all I can offer you now.

The central part of the lib is PoloManager. This class holds socket connection and PairMarket instances, 
and connects them between.

```javascript
const PoloManager = require('poloniex-orderbook');
const poloman = new PoloManager().connect({ 
  headers: require('./headers.json') 
});

// call connect to initiate socket connection
poloman.connect();
```
Now you can set event handlers:
```javascript
poloman.on('change', info => { /* info = {channel, side, rate, amount}*/});
poloman.on('error', info => { /* info = {msg} */});
```

initiate markets:
```javascript
poloman.market('BTC_ETH');
```

remove markets:
```javascript
poloman.remove('BTC_ETH');
```

get access to markets orderbooks:
```javascript
// take first
poloman.market('BTC_ETH').asks[0];

// top 5
poloman.market('BTC_ETH').bids.slice(0, 5);
```

close connection:
```javascript
poloman.disconnect();
```
 
### Note:
 * You HAVE to set Error handler otherwise the script will throw an Error and exit if error event will occur. 
 (see: [Node.js ErrorEvents](https://nodejs.org/api/events.html#events_error_events))
 * For debug purposes run with `DEBUG=*` variable.
 
Example
-------
```javascript
const PoloManager = require('poloniex-orderbook');
const poloman = new PoloManager().connect({ 
  headers: require('./headers.json') 
});

poloman.on('error', err => console.log(err));

poloman.on('change', info => {
  const {channel, side} = info;
  const market = poloman.market(channel);
  const top5 = market[side].slice(0, 5);

  console.log(`${side.toUpperCase()} :: ${market.seq}`);
  console.log(top5);
});

poloman.market('BTC_ETC');

// 5 seconds later
setTimeout(() => {
  //poloman.disconnect();
}, 5000);
```

you should get the output:
```Shell
ASKS :: 132227424
[ [ '0.00178668', '412.77676591' ],
  [ '0.00178684', '99.99000000' ],
  [ '0.00178685', '10.85537516' ],
  [ '0.00178700', '0.23521517' ],
  [ '0.00179312', '1156.41500000' ] ]
ASKS :: 132227424
[ [ '0.00178668', '412.77676591' ],
  [ '0.00178684', '99.99000000' ],
  [ '0.00178685', '10.85537516' ],
  [ '0.00178700', '0.23521517' ],
  [ '0.00179312', '1156.41500000' ] ]
BIDS :: 132227425
[ [ '0.00178665', '1028.38378169' ],
  [ '0.00178610', '3400.02648465' ],
  [ '0.00178600', '177.11520540' ],
  [ '0.00178278', '179.50264208' ],
  [ '0.00178277', '10.93802113' ] ]
```

Contacts
--------
If you have some suggestions please email me: evilive3000@gmail.com
