(function () {
  var container = document.getElementById('bars');
  var barCount = 48;
  var bars = [];

  for (var i = 0; i < barCount; i++) {
    var bar = document.createElement('div');
    bar.className = 'bar';
    container.appendChild(bar);
    bars.push({ el: bar, value: 0, target: 0, velocity: 0 });
  }

  function hsl(h, s, l) {
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
  }

  var time = 0;
  function animate() {
    time += 0.016;

    for (var i = 0; i < barCount; i++) {
      var normalized = i / barCount;
      var wave1 = Math.sin(time * 2.5 + normalized * Math.PI * 3) * 0.5 + 0.5;
      var wave2 =
        Math.sin(time * 1.8 + normalized * Math.PI * 5 + 1.2) * 0.3 + 0.3;
      var wave3 =
        Math.sin(time * 3.2 + normalized * Math.PI * 2 - 0.8) * 0.2 + 0.2;
      var beat = Math.pow(Math.sin(time * 1.2) * 0.5 + 0.5, 3) * 0.4;

      bars[i].target = Math.min(
        1,
        wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2 + beat,
      );
    }

    for (var j = 0; j < barCount; j++) {
      var b = bars[j];
      var diff = b.target - b.value;
      b.velocity += diff * 0.3;
      b.velocity *= 0.7;
      b.value += b.velocity;
      b.value = Math.max(0, Math.min(1, b.value));

      var height = 4 + b.value * 96;
      var hue = 260 + (j / barCount) * 60;
      var lightness = 40 + b.value * 25;

      b.el.style.height = height + '%';
      b.el.style.background =
        'linear-gradient(to top, ' +
        hsl(hue, 80, lightness) +
        ', ' +
        hsl(hue + 20, 90, lightness + 15) +
        ')';
      b.el.style.boxShadow =
        '0 0 ' + Math.round(b.value * 6) + 'px ' + hsl(hue, 80, lightness);
    }

    requestAnimationFrame(animate);
  }
  animate();
})();
