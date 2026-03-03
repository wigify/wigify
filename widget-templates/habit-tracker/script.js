(function () {
  var HABITS = ['exercise', 'read', 'water', 'meditate'];
  var STORAGE_KEY = 'wigify-habits';
  var DAYS = 7;

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function loadData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function calcStreak(data, habit) {
    var streak = 0;
    var today = new Date();
    for (var i = 0; i < 365; i++) {
      var d = new Date(today);
      d.setDate(today.getDate() - i);
      var key = d.toISOString().slice(0, 10);
      if (data[key] && data[key][habit]) streak++;
      else break;
    }
    return streak;
  }

  function renderHabit(data, habit) {
    var today = todayKey();
    var done = !!(data[today] && data[today][habit]);

    var chk = document.getElementById('chk-' + habit);
    if (chk) {
      if (done) chk.classList.add('done');
      else chk.classList.remove('done');
    }

    var dotsEl = document.getElementById('dots-' + habit);
    if (dotsEl) {
      dotsEl.innerHTML = '';
      var now = new Date();
      for (var i = DAYS - 1; i >= 0; i--) {
        var d = new Date(now);
        d.setDate(now.getDate() - i);
        var key = d.toISOString().slice(0, 10);
        var dot = document.createElement('div');
        dot.className = 'dot' + (data[key] && data[key][habit] ? ' done' : '');
        dotsEl.appendChild(dot);
      }
    }

    var streakEl = document.getElementById('streak-' + habit);
    if (streakEl) {
      var s = calcStreak(data, habit);
      streakEl.textContent = s > 0 ? s + '🔥' : '';
      if (s > 0) streakEl.classList.add('hot');
      else streakEl.classList.remove('hot');
    }
  }

  function renderAll() {
    var data = loadData();
    HABITS.forEach(function (h) {
      renderHabit(data, h);
    });

    var dateEl = document.getElementById('date-str');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  window.toggleHabit = function (habit) {
    var data = loadData();
    var today = todayKey();
    if (!data[today]) data[today] = {};
    data[today][habit] = !data[today][habit];
    saveData(data);
    renderHabit(data, habit);
  };

  renderAll();
})();
