const autobahn = require("autobahn");
const debug = require('debug')('polobook:connection');

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
    connection.onopen = (session, details) => resolve(session);

    connection.onclose = (reason, details) => {
      debug('onClose event');
      if (reason === 'closed') return;
      debug("REASON", reason);
      debug("DETAILS", details);
      reject(reason);
    };

    debug('Open connection');
    connection.open();
  });
}

/**
 *
 * @param {String} pair
 * @param {Function} handler
 * @returns {Promise}
 */
function subscribe(pair, handler) {
  if (!(connectionPromise instanceof Promise)) {
    connectionPromise = poloConnect();
  }

  debug(`Subscribe: ${pair}`);
  return connectionPromise.then(
    session => session.subscribe(pair, handler)
  );
}

/**
 *
 * @param {Subscription} subscription
 * @returns {Promise}
 */
function unsubscribe(subscription) {
  if (connectionPromise instanceof Promise) {

    debug(`Unsubscribe`);
    return connectionPromise.then(
      session => subscription.unsubscribe()
    );
  }
}

/**
 *
 */
function closeConnection() {
  debug('Close connection');
  connection.close();
  connectionPromise = null;
}

module.exports = {subscribe, unsubscribe, closeConnection};