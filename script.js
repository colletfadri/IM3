fetch('unload.php')
  .then(response => response.json())
  .then(rawData => {
    const totalsByInterval = {};

    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0]; // "YYYY-MM-DD"

    rawData.forEach(item => {
      const date = new Date(item.created_time);
      const dateString = date.toISOString().split('T')[0];

      // 🧩 Only keep data from *today*
      if (dateString === todayDateString) {
        const hour = date.getHours();

        // Round down to the nearest even hour → 0, 2, 4, ..., 22
        const roundedHour = hour - (hour % 2);
        const roundedLabel = `${String(roundedHour).padStart(2, '0')}:00`;

        const freeBikes = Number(item.free_bikes) || 0;

        if (!totalsByInterval[roundedLabel]) {
          totalsByInterval[roundedLabel] = 0;
        }
        totalsByInterval[roundedLabel] += freeBikes;
      }
    });

    // Sort by hour
    const labels = Object.keys(totalsByInterval).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
    const values = labels.map(label => totalsByInterval[label]);

    // Chart setup
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Total Free Bikes (Today, every 2h)',
          data: values,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          fill: true
        }
      ]
    };

    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Total Free Bikes (Every 2 Hours Today)'
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Time (2-hour intervals)' },
            ticks: {
              autoSkip: false,
              callback: function (value, index, ticks) {
                const label = this.getLabelForValue(value);
                const hour = parseInt(label.split(':')[0]);
                return hour % 2 === 0 ? label : '';
              }
            }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Total Free Bikes' }
          }
        }
      }
    };

    new Chart(document.getElementById('myChart'), config);
  })
  .catch(error => console.error('Error loading data:', error));


let map;
let markers = [];

// Farbskala abhängig von der Anzahl Bikes
function getColor(freeBikes) {
  if (freeBikes > 10) return "green";
  if (freeBikes > 5) return "orange";
  return "red";
}

// Karteninitialisierung
function initMap() {
  map = L.map('map').setView([46.85065, 9.53145], 13); // Zentrum Chur

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  updateMap("day"); // Default Ansicht
}

function updateMap(mode) {
  fetch('unload.php')
    .then(res => res.json())
    .then(data => {
      // Leere alte Marker
      markers.forEach(m => map.removeLayer(m));
      markers = [];

      // Filter je nach Modus (Tag, Woche, Monat)
      const now = new Date();
      const filtered = data.filter(item => {
        const created = new Date(item.created_time);
        const diffHours = (now - created) / 1000 / 3600;
        if (mode === "day") return diffHours < 24;
        if (mode === "week") return diffHours < 24 * 7;
        if (mode === "month") return diffHours < 24 * 30;
        return true;
      });

      // Gruppiere nach Station
      const grouped = {};
      filtered.forEach(station => {
        const name = station.name;
        if (!grouped[name]) grouped[name] = { ...station, totalBikes: 0, count: 0 };
        grouped[name].totalBikes += station.free_bikes;
        grouped[name].count++;
      });

      // Durchschnitt berechnen
      const averages = Object.values(grouped).map(s => ({
        name: s.name,
        latitude: s.latitude,
        longitude: s.longitude,
        avgBikes: s.totalBikes / s.count
      }));

      // Top 3 Stationen nach Durchschnitt
      const top3 = averages.sort((a, b) => b.avgBikes - a.avgBikes).slice(0, 3);

      // Marker hinzufügen
      top3.forEach((station, index) => {
        const color = getColor(station.avgBikes);
        const icon = L.divIcon({
          html: `<div style="background:${color};border-radius:50%;width:20px;height:20px;border:2px solid white;"></div>`,
          className: '',
          iconSize: [20, 20]
        });

        const marker = L.marker([station.latitude, station.longitude], { icon }).addTo(map);
        marker.bindPopup(`<b>${station.name}</b><br>Ø ${station.avgBikes.toFixed(1)} Bikes`);
        markers.push(marker);
      });
    })
    .catch(err => console.error("Fehler beim Laden:", err));
}

document.addEventListener('DOMContentLoaded', initMap);
