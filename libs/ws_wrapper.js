const debug = require('debug')('polobook:ws');
const WebSocket = require('ws');
const EventEmitter = require('events');

const char2event = {
  'i': 'initialize',
  'o': 'order',
  't': 'history'
};

class WsWrapper extends EventEmitter {
  /**
   *
   * @param {String} url
   * @param {Object?} options
   */
  constructor(url, options = {}) {
    super();

    this.commandsQueue = [];
    this.channelById = {};
    //this.heartbeat = Date.now() + 4000;

    this.ws = new WebSocket(url, [], options);

    /** on open */
    this.ws.onopen = (e) => {
      debug('open');

      //this.heartbeat = Date.now();
      this._keepAliveInterval = setInterval(() => {this.ws.send(".")}, 60000);
      this.state = e.target.readyState;

      // execute all queued commands
      while (this.commandsQueue.length) {
        this.send.apply(this, this.commandsQueue.shift());
      }
    };

    /** on message */
    this.ws.onmessage = (e) => {
      debug('message');

      //this.heartbeat = Date.now();

      if (e.data.length === 0) {
        // is it possible scenario?
        throw new Error('Empty data');
      }

      const msg = JSON.parse(e.data);

      if ('error' in msg) {
        return this.emit('error', msg);
      }

      const cid = msg.shift();

      // if cid is currencyPair channel
      if (0 < cid && cid < 1000) {
        return this._marketEvent(cid, ...msg);
      }


      if (cid === 1010) {
        // heartbeat
        return;
      }

      console.log({ cid, msg });
    };


    /** on error */
    this.ws.onerror = (errorEvent) => {
      debug('error', errorEvent.message);

      if (/403/.test(errorEvent.message)) {
        this.ws.terminate();
        console.log("Poloniex is protected with CloudFlare & reCaptcha.")
        console.log("Please set or check request header information to use this lib.");
        process.exit();
      }

      console.log(errorEvent);
    };

    /** on close */
    this.ws.onclose = (closeEvent) => {
      const { type, wasClean, reason, code } = closeEvent;

      clearInterval(this._keepAliveInterval);

      debug('close', { type, wasClean, reason, code });
    }
  }

  /**
   *
   * @param command
   * @param channel
   * @returns {Number}
   */
  send(command, channel) {
    if (this.state !== WebSocket.OPEN) {
      return this.commandsQueue.push([command, channel]);
    }

    debug(command, channel);

    this.ws.send(JSON.stringify({ command, channel }));
  }

  /**
   *
   * @param channel
   */
  subscribe(channel) {
    this.send('subscribe', channel);
  }

  /**
   *
   * @param channel
   */
  unsubscribe(channel) {
    this.send('unsubscribe', channel);
  }

  /**
   *
   */
  close() {
    this.ws.close();
  }

  /**
   *
   * @param cid
   * @param seq
   * @param stack
   * @private
   */
  _marketEvent(cid, seq, stack) {
    if (arguments.length === 3) {
      for (const data of stack) {
        const char = data.shift();
        if (char == 'i') {
          this.channelById[cid] = data[0].currencyPair;
        }
        this.emit(char2event[char], this.channelById[cid], seq, ...data);
      }
    }

    if (arguments.length === 2 && seq === 0) {
      this.emit('unsubscribed', this.channelById[cid])
    }
  }
}

module.exports = WsWrapper;