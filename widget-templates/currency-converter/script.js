(function () {
  var PAIRS = [
    { id: 'r-USDEUR', from: 'USD', to: 'EUR' },
    { id: 'r-USDGBP', from: 'USD', to: 'GBP' },
    { id: 'r-USDJPY', from: 'USD', to: 'JPY' },
    { id: 'r-EURGBP', from: 'EUR', to: 'GBP' },
  ];

  var updatedEl = document.getElementById('updated');

  function fmt(rate, to) {
    if (to === 'JPY') return rate.toFixed(2);
    return rate.toFixed(4);
  }

  function render(rates) {
    PAIRS.forEach(function (p) {
      var el = document.getElementById(p.id);
      if (!el) return;
      var rate =
        rates[p.from] && rates[p.to] ? rates[p.to] / rates[p.from] : null;
      if (rate) {
        el.textContent = fmt(rate, p.to);
        el.classList.remove('loading');
      } else {
        el.textContent = 'N/A';
      }
    });

    var now = new Date();
    updatedEl.textContent =
      now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
  }

  function load() {
    fetch(
      'https://api.frankfurter.app/latest?base=USD&symbols=EUR,GBP,JPY,CHF,CAD',
    )
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var rates = Object.assign({ USD: 1 }, data.rates);
        render(rates);
      })
      .catch(function () {
        updatedEl.textContent = 'offline';
      });
  }

  load();
  setInterval(load, 60000);
})();
