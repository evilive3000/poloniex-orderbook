"use strict";

const orderBook = require("./libs/orderbook");
const subscribe = require("./libs/marketevents");

const _ = require("lodash");

const DEBUG = "true" === _.get(process.env, "POLONIEX_DEBUG", false);

const log = function () {
  DEBUG && console.log.apply(console, arguments);
};

class OrderBook {

  /**
   *
   * @param pair
   */
  constructor(pair) {
    this.pair = (_.isArray(pair) ? pair.join("_") : pair).toUpperCase();
    this.buffer = {};
    this.asks = [];
    this.bids = [];
    this.seq = null;
    this.isFrozen = null;
    this._started = null;
    this.depth = 9999999;
    // overwrite methods with locked context
    _.bindAll(this, ["_onOrderTrade", "resetOrderBook"]);
  }

  /**
   * Start listening and syncing orderbook
   *
   * @returns {Promise}
   */
  start() {
    if (this._started) return this._started;

    // check if this pair is valid
    // subscribe for the push events
    // and reset the orderbook with full data
    return this._started = orderBook(this.pair, 1)
      .then(() => subscribe(this.pair, this._onOrderTrade))
      .then(this.resetOrderBook);
  }

  /**
   * Reset orderbook
   *
   * @returns {Promise}
   */
  resetOrderBook() {
    if (this._resetInProgress)
      return this._resetInProgress;
    this.seq = null;

    this._resetInProgress = orderBook(this.pair, this.depth).then(ob => {
      _.extend(this, ob);
      // clear stale data
      for (const seq of _.keys(this.buffer)) {
        if (seq <= this.seq)
          delete this.buffer[seq];
      }
      log(`Reset Order Book: ${this.pair}`);
      delete this._resetInProgress;
    });

    return this._resetInProgress;
  }

  /**
   * Push message handler
   *
   * @param res
   * @param seq
   * @private
   */
  _onOrderTrade(res, {seq}) {
    for (const order of res) {
      // ignore history events
      if (order.type == "newTrade")
        continue;

      if (!(seq in this.buffer)) {
        this.buffer[seq] = [];
      }
      // push update into buffer
      this.buffer[seq].push(order);
    }

    // now we read from the buffer and
    // increment orderbook sequentially.
    // order by order according to its `seq`
    this._processBuffer();
  }

  /**
   *
   * @private
   */
  _processBuffer() {
    while ((this.seq + 1) in this.buffer) {
      this.seq++;
      for (const order of this.buffer[this.seq]) {
        // _orderBookRemove | _orderBookModify
        this['_' + order.type](order);
      }
      delete this.buffer[this.seq];
    }

    // When the buffer grows too big, it may be some kind of issue,
    // and in the perfect world we should investigate and fix it,
    // but in our case it's much easier to reset orderbook and
    // implement all accumulated updates again.
    // Poloniex's frontend works the same way "reset and reload".
    if (!this._resetInProgress && _.size(this.buffer) > 25) {
      log(`Buffer is too fat: ${_.size(this.buffer)}`);
      this.resetOrderBook();
    }
  }


  /**
   * Returns index of order in orderbook.
   * If it is new order, then index is the
   * position we should insert it to keep
   * the table sorted.
   *
   * I'm using binary search to get the index,
   * so it's as fast as possible. Also we have
   * take into account the type of order, because
   * it's different sort order for `asks` and `bids`.
   *
   * @param order
   * @returns {number}
   * @private
   */
  _getIndex(order) {
    switch (order.data.type) {
      case "ask":
        return _.sortedIndexBy(this.asks, [order.data.rate], o => parseFloat(o[0]));
      case "bid":
        return _.sortedIndexBy(this.bids, [order.data.rate], o => -parseFloat(o[0]));
    }
  }

  /**
   * Handle remove orders
   *
   * @param order
   * @private
   */
  _orderBookRemove(order) {
    const type = order.data.type + "s";
    const index = this._getIndex(order);
    const old = this[type][index];
    if (old && old[0] === order.data.rate) {
      this[type].splice(index, 1);
    } else {
      log(":::_orderBookRemove:::");
      log("We should never get here, but if we got let me know!");
      log(index, order, old);
      process.exit();
    }
  }

  /**
   * Handle update orders
   *
   * @param order
   * @private
   */
  _orderBookModify(order) {
    const data = order.data;
    const type = data.type + "s";
    const index = this._getIndex(order);
    const old = this[type][index];
    if (old && old[0] === data.rate) {
      old[1] = parseFloat(data.amount);
    } else {
      this[type].splice(index, 0, [data.rate, parseFloat(data.amount)]);
    }
  }
}

module.exports = OrderBook;