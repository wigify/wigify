(function () {
  var now = new Date();
  var targetYear =
    now.getMonth() === 11 && now.getDate() === 31
      ? now.getFullYear() + 2
      : now.getFullYear() + 1;
  var target = new Date(targetYear, 0, 1);

  var circumference = 2 * Math.PI * 12;
  var progressEl = document.getElementById('progress');
  progressEl.style.strokeDasharray = circumference;

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function update() {
    var diff = target - new Date();
    if (diff <= 0) {
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('mins').textContent = '00';
      document.getElementById('secs').textContent = '00';
      return;
    }

    var totalSecs = Math.floor(diff / 1000);
    var d = Math.floor(totalSecs / 86400);
    var h = Math.floor((totalSecs % 86400) / 3600);
    var m = Math.floor((totalSecs % 3600) / 60);
    var s = totalSecs % 60;

    document.getElementById('days').textContent = pad(d);
    document.getElementById('hours').textContent = pad(h);
    document.getElementById('mins').textContent = pad(m);
    document.getElementById('secs').textContent = pad(s);

    var secProgress = 1 - s / 60;
    progressEl.style.strokeDashoffset = circumference * secProgress;

    requestAnimationFrame(update);
  }
  update();
})();
