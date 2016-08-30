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

and just start listening orderbook udpdate. `start` returns ES6 Promise, so you can do your work in `then`
```javascript
polobook.start()
  .then(() => { /* polobook is synced and ready */ });
```

now you can watch updates:
```javascript
console.log(polobook.asks)
console.log(polobook.bids)
```

#####Note:
 * You can create different pairs orderbooks, they will work ok simultaneously (see [examples](https://github.com/evilive3000/poloniex-orderbook/tree/master/examples) )
 * This module written with `ES6` syntax. Check your nodejs version if you get some errors first.

Example
-------
```javascript
"use strict";

const PoloBook = require('poloniex-orderbook');
const polobook = new PoloBook("btc_xmr");

polobook.start().then(() => {
  console.log(polobook.asks.slice(0, 10));
  console.log('-------------------------');
  console.log(polobook.bids.slice(0, 10));
}).catch(error => console.log(error));
```

you should get output like this:
```Shell
[ [ '0.01431999', 0.77974162 ],
  [ '0.01432000', 115.71500042 ],
  [ '0.01432001', 47.99559466 ],
  [ '0.01432215', 5.06983173 ],
  [ '0.01434657', 2.61260333 ],
  [ '0.01434658', 4 ],
  [ '0.01435000', 13.92148 ],
  [ '0.01435385', 23.29175115 ],
  [ '0.01436000', 0.5 ],
  [ '0.01436017', 87.95229339 ] ]
-------------------------
[ [ '0.01420000', 558.54511746 ],
  [ '0.01418879', 4.639175 ],
  [ '0.01418368', 0.65352199 ],
  [ '0.01416569', 5.60436236 ],
  [ '0.01416450', 32.03058816 ],
  [ '0.01416000', 0.12412218 ],
  [ '0.01415001', 504.724 ],
  [ '0.01415000', 407.53385512 ],
  [ '0.01413966', 0.84143041 ],
  [ '0.01413935', 191.98591077 ] ]
```

Contacts
--------
If you have some suggestions please email me: evilive3000@gmail.com
