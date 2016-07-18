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
   * Старт синхронизации и прослушки таблицы ордеров.
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
      try {
        this._onOrderTrade(res);
      } catch (e) {
        log(e);
      }
    }, true);

    // после того как подписались на рассылку изменений, загружаем всю таблицу целиком.
    setTimeout(this.resetOrderBook.bind(this), 1000);
    return this;
  }

  /**
   * Сброс/загрузка полной таблицы ордеров
   */
  resetOrderBook() {
    if (this._resetInProgress) return;
    this._resetInProgress = true;
    this.seq = null;

    poloPublic.returnOrderBook(this.pair, this.depth, (err, res) => {
      if (err) return log(err);
      _.extend(this, _.pick(res, ['asks', 'bids', 'seq', 'isFrozen']));
      // clear stale data
      // удаляем протухшие данные об обновлениях
      for (const seq in this.buffer) {
        if (seq <= this.seq)
          delete this.buffer[seq];
      }
      log(`Reset Order Book: ${this.pair}`);
      this._resetInProgress = false;
    });
  }

  /**
   *
   * @param res
   * @private
   */
  _onOrderTrade(res) {
    for (const order of res) {
      // игнорируем события связанные с историей
      if (order.updateType == 'newTrade')
        continue;

      if (!(order.seq in this.buffer)) {
        this.buffer[order.seq] = [];
      }
      // дописываем обновления в буфер
      this.buffer[order.seq].push(order);
    }

    // а теперь читаем из буфера и обновляем
    // таблицу ордеров в правильном порядке
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

    // если вдруг буфер раздуло до больших размеров
    // то скорее всего произошел какой-то сбой,
    // и надо выяснить и починить, но можно поступить проще:
    // можно просто перезагрузить заново таблицу ордеров, и
    // накатить на неё накопившиеся изменения.
    if (!this._resetInProgress && _.size(this.buffer) > 25) {
      log(`Buffer is too fat: ${_.size(this.buffer)}`);
      this.resetOrderBook();
    }
  }


  /**
   * Получаем индекс позиции ордера в таблице. Если такого ордера в таблице небыло, то
   * полученный индекс показывает позицию на который можно вставить данный ордер, не
   * нарушив сортировки. Для определения индекса используется бинарный поиск, а также
   * учитывается последовательность сортировки для разного типа ордеров `asks` и `bids`
   * так как один идет по возрастанию, друго по убыванию.
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
   * Событие ордера требующее удалить указанный ордер
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
   * Событие обновления ордера
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