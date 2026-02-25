(function () {
  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function update() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();
    var isPM = h >= 12;
    var h12 = h % 12 || 12;

    document.getElementById('time-main').textContent = pad(h12) + ':' + pad(m);
    document.getElementById('time-seconds').textContent = pad(s);
    document.getElementById('period').textContent = isPM ? 'PM' : 'AM';

    document.getElementById('date-display').textContent =
      days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate();

    requestAnimationFrame(update);
  }
  update();
})();
