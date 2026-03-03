(function () {
  var COINS = ['BTC', 'ETH', 'SOL'];
  var IDS = { BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana' };
  var history = { BTC: [], ETH: [], SOL: [] };

  var tsEl = document.getElementById('ts');

  function fmtPrice(p) {
    if (p >= 10000) return '$' + Math.round(p).toLocaleString();
    if (p >= 100) return '$' + p.toFixed(2);
    return '$' + p.toFixed(3);
  }

  function drawSparkline(canvas, data, isUp) {
    if (!data.length) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var min = Math.min.apply(null, data);
    var max = Math.max.apply(null, data);
    var range = max - min || 1;

    var pts = data.map(function (v, i) {
      return {
        x: (i / (data.length - 1)) * w,
        y: h - ((v - min) / range) * (h - 4) - 2,
      };
    });

    ctx.beginPath();
    pts.forEach(function (p, i) {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });

    var grad = ctx.createLinearGradient(0, 0, w, 0);
    if (isUp) {
      grad.addColorStop(0, 'rgba(52,211,153,0.4)');
      grad.addColorStop(1, 'rgba(52,211,153,1)');
    } else {
      grad.addColorStop(0, 'rgba(248,113,113,0.4)');
      grad.addColorStop(1, 'rgba(248,113,113,1)');
    }
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function render(coin, price, change24h) {
    var priceEl = document.getElementById('price-' + coin);
    var changeEl = document.getElementById('change-' + coin);
    if (!priceEl || !changeEl) return;

    priceEl.textContent = fmtPrice(price);

    var isUp = change24h >= 0;
    changeEl.textContent = (isUp ? '+' : '') + change24h.toFixed(2) + '%';
    changeEl.className = 'coin-change ' + (isUp ? 'up' : 'down');

    history[coin].push(price);
    if (history[coin].length > 20) history[coin].shift();

    var canvas = document.getElementById('spark-' + coin);
    if (canvas) drawSparkline(canvas, history[coin], isUp);
  }

  function load() {
    var ids = COINS.map(function (c) {
      return IDS[c];
    }).join(',');
    fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=' +
        ids +
        '&vs_currencies=usd&include_24hr_change=true',
    )
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        COINS.forEach(function (coin) {
          var d = data[IDS[coin]];
          if (d) render(coin, d.usd, d.usd_24h_change || 0);
        });
        var now = new Date();
        tsEl.textContent =
          now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
      })
      .catch(function () {
        tsEl.textContent = 'offline';
      });
  }

  load();
  setInterval(load, 60000);
})();
