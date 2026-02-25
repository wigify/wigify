(function () {
  var script = document.createElement('script');
  script.src =
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js';
  document.head.appendChild(script);

  function init() {
    var ctx = document.getElementById('chart').getContext('2d');
    var labels = [
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
    var data = [
      3200, 4100, 3800, 5200, 4800, 6100, 5900, 7200, 6800, 8400, 9100, 12480,
    ];

    var gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            borderColor: '#8b5cf6',
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: '#8b5cf6',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { left: 0, right: 4, top: 4, bottom: 0 },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(30,30,30,0.9)',
            titleColor: 'rgba(255,255,255,0.6)',
            bodyColor: '#fff',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 6,
            displayColors: false,
            titleFont: { size: 10 },
            bodyFont: { size: 11 },
            callbacks: {
              label: function (context) {
                return '$' + context.parsed.y.toLocaleString();
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            grid: { display: false },
            ticks: {
              color: 'rgba(255,255,255,0.25)',
              font: { size: 9 },
              maxRotation: 0,
            },
            border: { display: false },
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(255,255,255,0.04)',
            },
            ticks: {
              color: 'rgba(255,255,255,0.25)',
              font: { size: 9 },
              maxTicksLimit: 4,
              callback: function (value) {
                return '$' + (value / 1000).toFixed(0) + 'k';
              },
            },
            border: { display: false },
          },
        },
      },
    });
  }

  script.onload = init;
})();
