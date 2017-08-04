const _ = require('lodash');
const debug = require('debug')('polobook:market');

// poloniex.com does the same check:
// arg[3] === "0.00000000" ? "Remove" : "Modify"
const AMOUNT_ZERO = '0.00000000';
const TIMEOUT = 15; // seconds

class Market {

  /**
   *
   * @param pair
   * @param manager
   */
  constructor(pair, manager) {
    debug('create', pair);

    this.pair = pair;
    this.manager = manager;
    this.seq = null;
    this.orderBook = [{}, {}];
    this.orderList = [[], []];

    // will be set True if it's valid
    this.validPair = null;
    this._initTimeout = setTimeout(() => {
      this.setValid(false)
    }, TIMEOUT * 1000);
  }

  initialize(channel, seq, data) {
    debug('initialize', channel);

    this.seq = seq;

    for (let side = 0; side < 2; side++) {
      this.orderBook[side] = data.orderBook[side];
      this.orderList[side] = convertBookToList(data.orderBook[side]);
    }

    this.setValid(true);
  }

  order(channel, seq, side, rate, amount) {
    debug('order');

    if (_.isNull(this.seq)) {
      // temporary checking
      console.log('order called before market initialized');
      process.exit();
    }

    if (seq < this.seq || this.seq + 1 < seq) {
      const info = {orderSeq: seq, marketSeq: this.seq};
      return this._onError('Wrong seq number', info);
    }

    this.seq = seq;
    amount === AMOUNT_ZERO
      ? this.remove(side, rate)
      : this.modify(side, rate, amount);

    this._onChange(side, rate, amount);
  }

  /**
   *
   * @private
   */
  remove(side, rate) {
    const index = getIndex(this.orderList, side, rate);
    this.orderList[side].splice(index, 1);
    delete this.orderBook[side][rate];
  }

  /**
   *
   * @private
   */
  modify(side, rate, amount) {
    const index = getIndex(this.orderList, side, rate);
    const updateOrInsert = rate in this.orderBook[side] ? 1 : 0;
    this.orderList[side].splice(index, updateOrInsert, [rate, amount]);
    this.orderBook[side][rate] = amount;
  }

  get asks() {
    return this.orderList[0]
  }

  get bids() {
    return this.orderList[1]
  }

  /**
   *
   * @param {Boolean} val
   */
  setValid(val) {
    clearTimeout(this._initTimeout);
    this.validPair = val;
    if (!this.validPair) {
      this._onError('Invalid pair');
    }
  }

  /**
   *
   * @param msg
   * @param info
   * @private
   */
  _onError(msg, info = {}) {
    Object.assign(info, {msg, channel: this.pair});

    this.manager.marketEvent(`error`, info);
  }

  /**
   *
   * @param side
   * @param rate
   * @param amount
   * @private
   */
  _onChange(side, rate, amount) {
    const info = {
      side: side === 0 ? 'asks' : 'bids',
      rate,
      amount,
      channel: this.pair
    };

    this.manager.marketEvent(`change`, info);
  }
}

/**
 *
 */
const iteratees = [
  order => parseFloat(order[0]),
  order => -parseFloat(order[0])
];

/**
 *
 * @param orderList
 * @param side
 * @param rate
 * @returns {number}
 */
function getIndex(orderList, side, rate) {
  const fRate = parseFloat(rate);
  return _.sortedIndexBy(orderList[side], [fRate], iteratees[side]);
}

/**
 * @param ob
 * @returns {Array}
 */
function convertBookToList(ob) {
  const keys = Object.keys(ob);
  let i = keys.length;
  while (i--) {
    const rate = keys[i];
    keys[i] = [rate, ob[rate]];
  }
  return keys;
}

module.exports = Market;