"use strict";

const PoloBook = require("../index");

const polobook = new PoloBook("btc_xmr");

polobook.start().then(() => {
  console.log(polobook.asks.slice(0, 10));
  console.log('-------------------------');
  console.log(polobook.bids.slice(0, 10));
}).catch(error => console.log(error));