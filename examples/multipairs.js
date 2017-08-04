const PoloManager = require('../');
const poloman = new PoloManager().connect({ headers: require('./headers.json') });

poloman.on('error', err => console.log(err));

const pairs = ['BTC_ETH', 'USDT_ETH', 'USDT_BTC'];
const markets = {};

poloman.on('change', info => {
  const { side, channel } = info;
  const top5 = markets[channel][side].slice(0, 5);
  console.log(`${channel}.${side}`);
  console.log(top5);
});

for (const pair of pairs) {
  markets[pair] = poloman.market(pair);
}

// 5 seconds later
setTimeout(() => {
  poloman.remove('USDT_ETH');
  poloman.remove('USDT_BTC');
}, 5000);

// 10 seconds later
setTimeout(() => {
  poloman.disconnect();
}, 10000);