"use strict";

const polo = require('poloniex-unofficial');
const _ = require('lodash');

const poloPush = new polo.PushWrapper();
const poloPublic = new polo.PublicWrapper();

const DEBUG = 'true' === _.get(process.env, 'POLONIEX_DEBUG', false);

const log = function () {
  DEBUG && console.log.apply(console, arguments);
};

class OrderBook {

  /**
   *
   * @param pair
   */
  constructor(pair) {
    this.pair = (_.isArray(pair) ? pair.join('_') : pair).toUpperCase();
    this.buffer = {};
    this.asks = [];
    this.bids = [];
    this.seq = null;
    this.isFrozen = null;
    this._started = false;
    this.depth = 9999999;
  }

  /**
   * Start listening and syncing orderbook
   *
   * @returns {OrderBook}
   */
  start() {
    if (this._started) return this;
    this._started = true;
    poloPush.orderTrade(this.pair, (err, res) => {
      err && log(err);
      // почему-то все что происходит в методе orderTrade не вываливается при ошибках,
      // поэтому пришлось обвернуть все явным трай-кетчем, и вываливать ошбику самостоятельно.
      // for debug purposes
      try { this._onOrderTrade(res); } catch (e) { log(e); }
    }, true);

    // after we subscribe for poloniex push events we reload orderbook.
    setTimeout(this.resetOrderBook.bind(this), 1000);
    return this;
  }

  /**
   * Reset orderbook
   */
  resetOrderBook() {
    if (this._resetInProgress) return;
    this._resetInProgress = true;
    this.seq = null;

    poloPublic.returnOrderBook(this.pair, this.depth, (err, res) => {
      if (err) return log(err);
      _.extend(this, _.pick(res, ['asks', 'bids', 'seq', 'isFrozen']));
      // clear stale data
      for (const seq in this.buffer) {
        if (seq <= this.seq)
          delete this.buffer[seq];
      }
      log(`Reset Order Book: ${this.pair}`);
      this._resetInProgress = false;
    });
  }

  /**
   * Push message handler
   *
   * @param res
   * @private
   */
  _onOrderTrade(res) {
    for (const order of res) {
      // ignore history events
      if (order.updateType == 'newTrade')
        continue;

      if (!(order.seq in this.buffer)) {
        this.buffer[order.seq] = [];
      }
      // push update into buffer
      this.buffer[order.seq].push(order);
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
        this['_' + order.updateType](order);
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
    switch (order.type) {
      case 'ask':
        return _.sortedIndexBy(this.asks, [order.rate], o => parseFloat(o[0]));
      case 'bid':
        return _.sortedIndexBy(this.bids, [order.rate], o => -parseFloat(o[0]));
    }
  }

  /**
   * Handle remove orders
   *
   * @param order
   * @private
   */
  _orderBookRemove(order) {
    const type = order.type + 's';
    const index = this._getIndex(order);
    const old = this[type][index];
    if (old && old[0] === order.rate) {
      this[type].splice(index, 1);
    } else {
      log(':::_orderBookRemove:::');
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
    const type = order.type + 's';
    const index = this._getIndex(order);
    const old = this[type][index];
    if (old && old[0] === order.rate) {
      old[1] = parseFloat(order.amount);
    } else {
      this[type].splice(index, 0, [order.rate, parseFloat(order.amount)]);
    }
  }
}

module.exports = OrderBook;