"use strict";

const autobahn = require("autobahn");

const connection = new autobahn.Connection({
  url: "wss://api.poloniex.com",
  realm: "realm1"
});

let connectionPromise;

/**
 *
 * @returns {Promise}
 */
function poloConnect() {
  return new Promise((resolve, reject) => {
    connection.onopen = (session, details) => {
      // console.log(details);
      resolve(session);
    };

    connection.onclose = (reason, details) => {
      console.log("REASON", reason);
      console.log("DETAILS", details);
      reject(reason);
    };

    connection.open();
  });
}

/**
 *
 * @param pair
 * @param handler
 * @returns {Promise}
 */
function subscribe(pair, handler) {
  if (!(connectionPromise instanceof Promise)) {
    connectionPromise = poloConnect();
  }

  return connectionPromise.then(
    session => session.subscribe(pair, handler)
  );
}

module.exports = subscribe;

// subscribe("BTC_XMR", (args, kwargs) => console.log(args, kwargs))
//   .catch(e => console.log('e', e));


// subscribe("BTC_ETH", (args, kwargs) => console.log('BTC_ETH', args.length));
// subscribe("BTC_ETC", (args, kwargs) => console.log('BTC_ETC', args, kwargs));
// subscribe("BTC_XMR", (args, kwargs) => console.log('BTC_XMR', args.length));