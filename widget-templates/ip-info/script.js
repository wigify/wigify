(function () {
  var ipEl = document.getElementById('ip-addr');
  var ipTypeEl = document.getElementById('ip-type');
  var locationEl = document.getElementById('location');
  var ispEl = document.getElementById('isp');
  var tzEl = document.getElementById('timezone');
  var asnEl = document.getElementById('asn');
  var vpnBadge = document.getElementById('vpn-badge');

  function isVpnLike(org) {
    if (!org) return false;
    var lower = org.toLowerCase();
    return (
      lower.includes('vpn') ||
      lower.includes('proxy') ||
      lower.includes('tunnel') ||
      lower.includes('mullvad') ||
      lower.includes('nordvpn') ||
      lower.includes('expressvpn') ||
      lower.includes('datacenter') ||
      lower.includes('hosting')
    );
  }

  function isIPv6(ip) {
    return ip && ip.includes(':');
  }

  function load() {
    fetch('https://free.freeipapi.com/api/json')
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        var ip = d.ipAddress || '--';
        ipEl.textContent = ip;
        ipTypeEl.textContent =
          d.ipVersion === 6 || isIPv6(ip) ? 'IPv6' : 'IPv4';

        var city = d.cityName || '';
        var country = d.countryName || '';
        locationEl.textContent =
          city && country ? city + ', ' + country : country || '--';

        var org = d.asnOrganization || '';
        ispEl.textContent = org.slice(0, 22) || '--';

        var tz = (d.timeZones && d.timeZones[0]) || '--';
        tzEl.textContent = tz.replace(/_/g, ' ');

        var asn = d.asn ? 'AS' + d.asn : '--';
        asnEl.textContent = asn;

        if (d.isProxy || isVpnLike(org)) {
          vpnBadge.classList.add('visible');
        } else {
          vpnBadge.classList.remove('visible');
        }
      })
      .catch(function () {
        ipEl.textContent = 'Offline';
      });
  }

  load();
  setInterval(load, 300000);
})();
