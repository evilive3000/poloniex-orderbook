Poloniex Orderbook
==================

Module for creating and maintaining Poloniex's orderbook on server side.
I use Push API and binary search so it must be as fast as possible.
After inspection Poloniex's code on the `poloniex.com` can say that the module must be more robust and faster.

Installation
------------------
```Shell
$ npm install poloniex-orderbook
```

Usage
-----
Require library first
```javascript
const PoloBook = require('poloniex-orderbook');
```

create orderbook instance and provide currency pair you want to subscribe:
```javascript        
// currency title is case-insensetive
const polobook = new PoloBook(['btc', 'eth']);
// or
const polobook = new PoloBook('btc_eth');
```

and just start listening orderbook udpdate:
```javascript
polobook.start();
```

now you can watch updates:
```javascript
console.log(polobook.asks)
console.log(polobook.bids)
```

#####Note:
 * Data will not be available right after calling `start()`, you should delay for a few seconds.
 * You can create different pairs orderbooks, they will work ok simultaneously.
 * This module written with `ES6` syntax. Check your nodejs version if you get some errors first.

Example
-------
```javascript
"use strict";

const PoloBook = require('poloniex-orderbook');

const polobook = (new PoloBook('btc_eth')).start();

(function run() {
  console.log(`---===${new Date().toLocaleTimeString()}===---`);

  for(const type of ['asks', 'bids']) {
    console.log(`::::::${type}::::::`);
    for(const [rate, amount] of polobook[type].slice(0, 10)) {
      console.log(`${rate}: ${amount}`);
    }
  }

  setTimeout(run, 1000);
})();
```

you should get output like this:
```Shell
---===7:50:44 AM===---
::::::asks::::::
::::::bids::::::
---===7:50:45 AM===---
::::::asks::::::
0.01694686: 110.54001955
0.01694853: 0.400053
0.01694860: 0.800092
0.01694883: 4.15350764
0.01694884: 0.04
0.01695203: 0.400053
0.01695568: 0.48
0.01695853: 0.400044
0.01695879: 4.16
0.01695931: 0.2
::::::bids::::::
0.01694198: 4.24
0.01693548: 0.43
0.01692898: 4.15
0.01692583: 0.40164053
0.01692311: 0.01742012
0.01692248: 1.88
0.01691966: 0.40193044
0.01691200: 111.7489
0.01690947: 3.13
0.01689688: 0.40253048
```

Contacts
--------
If you have some suggestions please email me: evilive3000@gmail.com
