"use strict";

// https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_NXT&depth=10

const https = require("https");
const querystring = require("querystring");

const _path = "/public?command=returnOrderBook";
const options = {
  hostname: "poloniex.com",
  port: 443,
  method: "GET"
};

/**
 *
 * @param pair
 * @param depth
 * @returns {Promise}
 */
function returnOrderBook(pair, depth) {
  const params = {currencyPair: pair, depth: depth || 9999999};
  const path = _path + "&" + querystring.stringify(params);
  const opts = Object.assign({}, options, {path});

  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let data = "";

      res.on("data", chunk => data += chunk);

      res.on("end", () => {
        try {
          const obj = JSON.parse(data);
          obj.error ? reject(obj.error) : resolve(obj);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.end();

    req.on("error", reject);
  });
}

module.exports = returnOrderBook;

// returnOrderBook('BTC_XMR', 1)
//   .then(r => console.log(r))
//   .catch(e => console.log(e));