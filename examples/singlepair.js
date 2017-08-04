const PoloManager = require('../');
const poloman = new PoloManager().connect({ headers: require('./headers.json') });

poloman.on('error', err => console.log(err));

poloman.on('change', info => {
  const {channel, side} = info;
  const market = poloman.market(channel);
  const top5 = market[side].slice(0, 5);

  console.log(`${side.toUpperCase()} :: ${market.seq}`);
  console.log(top5);
});

poloman.market('BTC_ETH');

// 5 seconds later
setTimeout(() => {
  poloman.disconnect();
}, 5000);