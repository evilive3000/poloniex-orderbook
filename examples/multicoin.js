"use strict";

const PoloBook = require("../index");

const bookETH = new PoloBook("btc_eth");
const bookXMR = new PoloBook("btc_xmr");

// the function will run every 0.25 seconds
// and print current orderbook's top-10 orders
function run() {
  console.log(`\n---===${new Date().toLocaleTimeString()}===---`);

  for (const type of ["asks", "bids"]) {
    console.log(`::::::::::::::::::::${type}::::::::::::::::::::`);
    console.log(`\t${bookETH.pair}\t\t|\t\t${bookXMR.pair}`);

    for (let i = 0; i < 10; i++) {
      const [r1, a1] = bookETH[type][i];
      const [r2, a2] = bookXMR[type][i];
      console.log(`${r1}: ${a1.toFixed(4)}\t|\t${r2}: ${a2.toFixed(4)}`);
    }
  }

  setTimeout(run, 250);
}

Promise.all([bookETH.start(), bookXMR.start()])
  .then(run)
  .catch(err => console.log('err', err));