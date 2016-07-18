"use strict";

const PoloBook = require('../index');

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
