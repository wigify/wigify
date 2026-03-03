(function () {
  var DEFAULT_LAT = 37.7749;
  var DEFAULT_LON = -122.4194;
  var DEFAULT_CITY = 'San Francisco';

  var WMO_CONDITIONS = {
    0: { text: 'Clear Sky', icon: 'clear' },
    1: { text: 'Mostly Clear', icon: 'clear' },
    2: { text: 'Partly Cloudy', icon: 'partly-cloudy' },
    3: { text: 'Overcast', icon: 'cloudy' },
    45: { text: 'Fog', icon: 'fog' },
    48: { text: 'Freezing Fog', icon: 'fog' },
    51: { text: 'Light Drizzle', icon: 'rain' },
    53: { text: 'Drizzle', icon: 'rain' },
    55: { text: 'Heavy Drizzle', icon: 'rain' },
    56: { text: 'Freezing Drizzle', icon: 'rain' },
    57: { text: 'Freezing Drizzle', icon: 'rain' },
    61: { text: 'Light Rain', icon: 'rain' },
    63: { text: 'Rain', icon: 'rain' },
    65: { text: 'Heavy Rain', icon: 'rain' },
    66: { text: 'Freezing Rain', icon: 'rain' },
    67: { text: 'Freezing Rain', icon: 'rain' },
    71: { text: 'Light Snow', icon: 'snow' },
    73: { text: 'Snow', icon: 'snow' },
    75: { text: 'Heavy Snow', icon: 'snow' },
    77: { text: 'Snow Grains', icon: 'snow' },
    80: { text: 'Light Showers', icon: 'rain' },
    81: { text: 'Showers', icon: 'rain' },
    82: { text: 'Heavy Showers', icon: 'rain' },
    85: { text: 'Snow Showers', icon: 'snow' },
    86: { text: 'Heavy Snow Showers', icon: 'snow' },
    95: { text: 'Thunderstorm', icon: 'thunder' },
    96: { text: 'Thunderstorm w/ Hail', icon: 'thunder' },
    99: { text: 'Thunderstorm w/ Hail', icon: 'thunder' },
  };

  var tempEl = document.getElementById('temp');
  var conditionEl = document.getElementById('condition');
  var locationEl = document.getElementById('location');
  var iconWrap = document.getElementById('icon-wrap');

  function render(data) {
    var code = data.weatherCode;
    var info = WMO_CONDITIONS[code] || { text: 'Unknown', icon: 'cloudy' };

    tempEl.innerHTML = Math.round(data.temperature) + '<span>&deg;C</span>';
    conditionEl.textContent = info.text;
    locationEl.textContent = data.city;
    iconWrap.className = 'icon-wrap ' + info.icon;
  }

  function fetchWeather(lat, lon, city) {
    var url =
      'https://api.open-meteo.com/v1/forecast?latitude=' +
      lat +
      '&longitude=' +
      lon +
      '&current=temperature_2m,weather_code';

    fetch(url)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        render({
          temperature: data.current.temperature_2m,
          weatherCode: data.current.weather_code,
          city: city,
        });
      })
      .catch(function () {
        conditionEl.textContent = 'Failed to load';
      });
  }

  function reverseGeocode(lat, lon) {
    return fetch(
      'https://nominatim.openstreetmap.org/reverse?lat=' +
        lat +
        '&lon=' +
        lon +
        '&format=json&zoom=10',
    )
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        return (
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.county ||
          'Unknown'
        );
      })
      .catch(function () {
        return 'Lat ' + lat.toFixed(1) + ', Lon ' + lon.toFixed(1);
      });
  }

  function init() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var lat = pos.coords.latitude;
          var lon = pos.coords.longitude;
          reverseGeocode(lat, lon).then(function (city) {
            fetchWeather(lat, lon, city);
          });
        },
        function () {
          fetchWeather(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);
        },
        { timeout: 5000 },
      );
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);
    }
  }

  init();
})();
