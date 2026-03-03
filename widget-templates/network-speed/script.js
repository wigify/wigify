(function () {
  var pingEl = document.getElementById('ping');
  var dlEl = document.getElementById('dl');
  var ipEl = document.getElementById('ip');
  var ispEl = document.getElementById('isp');
  var dotEl = document.getElementById('status-dot');
  var barPing = document.getElementById('bar-ping');
  var barDl = document.getElementById('bar-dl');

  function setDot(ping) {
    dotEl.className = 'status-dot';
    if (ping < 50) dotEl.classList.add('good');
    else if (ping < 150) dotEl.classList.add('warn');
    else dotEl.classList.add('bad');
  }

  function measurePing() {
    var start = performance.now();
    return fetch('https://www.cloudflare.com/cdn-cgi/trace', {
      cache: 'no-store',
    })
      .then(function () {
        return Math.round(performance.now() - start);
      })
      .catch(function () {
        return null;
      });
  }

  function measureDownload() {
    var url = 'https://speed.cloudflare.com/__down?bytes=500000';
    var start = performance.now();
    return fetch(url, { cache: 'no-store' })
      .then(function (r) {
        return r.blob();
      })
      .then(function (blob) {
        var elapsed = (performance.now() - start) / 1000;
        var bits = blob.size * 8;
        var mbps = bits / elapsed / 1000000;
        return parseFloat(mbps.toFixed(1));
      })
      .catch(function () {
        return null;
      });
  }

  function loadIpInfo() {
    fetch('https://free.freeipapi.com/api/json')
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        ipEl.textContent = d.ipAddress || '--';
        ispEl.textContent = (d.asnOrganization || 'Unknown').slice(0, 22);
      })
      .catch(function () {
        ispEl.textContent = 'Unknown ISP';
      });
  }

  function run() {
    measurePing().then(function (ping) {
      if (ping !== null) {
        pingEl.textContent = ping;
        setDot(ping);
        var pct = Math.min(100, (1 - ping / 300) * 100);
        barPing.style.width = pct + '%';
      }
    });

    measureDownload().then(function (mbps) {
      if (mbps !== null) {
        dlEl.textContent = mbps;
        var pct = Math.min(100, (mbps / 100) * 100);
        barDl.style.width = pct + '%';
      }
    });
  }

  loadIpInfo();
  run();
  setInterval(run, 30000);
})();
