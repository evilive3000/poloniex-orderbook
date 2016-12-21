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
    connection.onopen = (session, details) => resolve(session);

    connection.onclose = (reason, details) => {
      if (reason === 'closed') return;

      console.log("REASON", reason);
      console.log("DETAILS", details);
      reject(reason);
    };

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

    return connectionPromise.then(
      session => subscription.unsubscribe()
    )
  }
}

/**
 *
 */
function closeConnection() {
  connection.close();
  connectionPromise = null;
}

module.exports = {subscribe, unsubscribe, closeConnection};