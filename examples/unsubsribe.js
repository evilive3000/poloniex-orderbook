"use strict";

process.env.POLONIEX_DEBUG = true;

const PoloBook = require("../index");

const polobook = new PoloBook("btc_eth");

function delay(ms) {
  return function () {
    console.log(`\tSLEEP: ${ms}ms`);
    return new Promise(res => {
      setTimeout(res.bind.apply(res, [null, ...arguments]), ms);
    })
  };
}

polobook.start()
  .then(delay(1000))
  .then(() => polobook.stop())
  .then(delay(1000))
  .then(() => polobook.start())
  .then(delay(1000))
  .then(() => PoloBook.close())
  .catch(error => console.log(error));


/********************** OUTPUT *****************************/
/*
  2016-11-25T13:21:19.358Z 'Start listening orderbook'
  2016-11-25T13:21:21.722Z 'Push message handler: 163723813'
  ...
  2016-11-25T13:21:22.400Z 'Push message handler: 163723816'
  2016-11-25T13:21:22.406Z 'Reset Order Book: BTC_ETH'
  SLEEP: 1000ms
  2016-11-25T13:21:22.409Z 'Push message handler: 163723817'
  ...
  2016-11-25T13:21:22.850Z 'Push message handler: 163723822'
  2016-11-25T13:21:23.410Z 'Stop listening orderbook'
  SLEEP: 1000ms                                             <--- no push messages here, until we restart polobook
  2016-11-25T13:21:24.413Z 'Start listening orderbook'
  2016-11-25T13:21:25.106Z 'Push message handler: 163723839'
  ...
  2016-11-25T13:21:26.093Z 'Push message handler: 163723854'
  2016-11-25T13:21:26.124Z 'Reset Order Book: BTC_ETH'
  SLEEP: 1000ms
  2016-11-25T13:21:26.413Z 'Push message handler: 163723855'
  ...
  2016-11-25T13:21:26.704Z 'Push message handler: 163723866'
  2016-11-25T13:21:27.125Z 'Close connection'               <--- after sending close command, we can receive few messages
  2016-11-25T13:21:27.143Z 'Push message handler: 163723869'
  ...
  2016-11-25T13:21:27.239Z 'Push message handler: 163723874'
*/
