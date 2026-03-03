(function () {
  var USER = 'torvalds';

  var avatarEl = document.getElementById('avatar');
  var usernameEl = document.getElementById('username');
  var streakCountEl = document.getElementById('streak-count');
  var reposEl = document.getElementById('repos');
  var followersEl = document.getElementById('followers');
  var gridEl = document.getElementById('grid');

  function renderGrid(events) {
    var counts = {};
    events.forEach(function (e) {
      var day = e.created_at.slice(0, 10);
      counts[day] = (counts[day] || 0) + 1;
    });

    var cells = [];
    var today = new Date();
    for (var i = 51; i >= 0; i--) {
      var d = new Date(today);
      d.setDate(today.getDate() - i);
      var key = d.toISOString().slice(0, 10);
      cells.push(counts[key] || 0);
    }

    var max = Math.max.apply(null, cells.concat([1]));
    gridEl.innerHTML = '';
    cells.forEach(function (c) {
      var div = document.createElement('div');
      div.className = 'cell';
      var ratio = c / max;
      if (ratio > 0.75) div.className += ' l4';
      else if (ratio > 0.5) div.className += ' l3';
      else if (ratio > 0.25) div.className += ' l2';
      else if (ratio > 0) div.className += ' l1';
      gridEl.appendChild(div);
    });

    var streak = 0;
    for (var j = 0; j < cells.length; j++) {
      if (cells[cells.length - 1 - j] > 0) streak++;
      else break;
    }
    streakCountEl.textContent = streak;
  }

  function load() {
    fetch('https://api.github.com/users/' + USER)
      .then(function (r) {
        return r.json();
      })
      .then(function (u) {
        usernameEl.textContent = u.login || USER;
        reposEl.textContent = u.public_repos || 0;
        followersEl.textContent =
          u.followers >= 1000
            ? (u.followers / 1000).toFixed(1) + 'k'
            : u.followers || 0;
        if (u.avatar_url) {
          avatarEl.src = u.avatar_url;
          avatarEl.style.display = 'block';
        }
      })
      .catch(function () {});

    fetch(
      'https://api.github.com/users/' + USER + '/events/public?per_page=100',
    )
      .then(function (r) {
        return r.json();
      })
      .then(function (events) {
        if (Array.isArray(events)) renderGrid(events);
      })
      .catch(function () {});
  }

  load();
  setInterval(load, 300000);
})();
