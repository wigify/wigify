(function () {
  var ZONES = [
    { tz: 'America/New_York', timeId: 't-0', ampmId: 'ap-0', ringId: 'ring-0' },
    { tz: 'Europe/London', timeId: 't-1', ampmId: 'ap-1', ringId: 'ring-1' },
    { tz: 'Asia/Tokyo', timeId: 't-2', ampmId: 'ap-2', ringId: 'ring-2' },
    { tz: 'Asia/Dubai', timeId: 't-3', ampmId: 'ap-3', ringId: 'ring-3' },
  ];

  var COLORS = ['#818cf8', '#34d399', '#f87171', '#fbbf24'];

  function drawRing(canvas, hFrac, color) {
    var ctx = canvas.getContext('2d');
    var cx = canvas.width / 2;
    var cy = canvas.height / 2;
    var r = cx - 3;
    var start = -Math.PI / 2;
    var end = start + hFrac * 2 * Math.PI;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (hFrac > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, end);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  function tick() {
    var now = Date.now();
    ZONES.forEach(function (z, i) {
      var d = new Date(now);
      var str = d.toLocaleTimeString('en-US', { timeZone: z.tz, hour12: true });
      var parts = str.match(/(\d+):(\d+):\d+\s*(\w+)/);
      if (!parts) return;

      var h = parseInt(parts[1], 10);
      var m = parseInt(parts[2], 10);
      var ap = parts[3].toUpperCase();

      document.getElementById(z.timeId).textContent =
        String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
      document.getElementById(z.ampmId).textContent = ap;

      var h24 =
        ap === 'PM' && h !== 12 ? h + 12 : ap === 'AM' && h === 12 ? 0 : h;
      var totalMins = h24 * 60 + m;
      var frac = totalMins / 1440;

      var canvas = document.getElementById(z.ringId);
      if (canvas) drawRing(canvas, frac, COLORS[i]);
    });

    setTimeout(tick, 10000);
  }

  tick();
})();
