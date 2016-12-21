"use strict";

const PoloBook = require("../index");

const polobook = new PoloBook("btc_xmr");

polobook.on('update',
  res => console.log(polobook.asks.slice(0, 1))
);

polobook.start()
  .catch(error => console.log(error));