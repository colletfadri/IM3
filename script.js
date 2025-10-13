let chartInstance = null;
let allData = [];

// 🟢 Fetch data
fetch('unload.php')
  .then(response => response.json())
  .then(rawData => {
    allData = rawData;

    // Get unique station names
    const stationNames = [...new Set(rawData.map(item => item.name))];

    // Populate dropdown
    const select = document.getElementById('stationSelect');
    stationNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });

    // Initially show total of all stations
    renderChart('all');

    // Handle selection change
    select.addEventListener('change', (event) => {
      const selected = event.target.value || 'all';
      renderChart(selected);
    });
  })
  .catch(error => console.error('Error loading data:', error));

// 🟣 Function: Render chart (all stations or one)
function renderChart(stationName) {
  const today = new Date().toISOString().split('T')[0];
  const filtered = allData.filter(item => {
    const itemDate = new Date(item.created_time).toISOString().split('T')[0];
    if (stationName === 'all') return itemDate === today;
    return item.name === stationName && itemDate === today;
  });

  // Group by hour
  const totalsByHour = {};
  filtered.forEach(item => {
    const date = new Date(item.created_time);
    const hour = date.getHours();
    const roundedTime = `${String(hour).padStart(2, '0')}:00`;
    const bikes = Number(item.free_bikes) || 0;

    if (stationName === 'all') {
      // Sum for all stations
      totalsByHour[roundedTime] = (totalsByHour[roundedTime] || 0) + bikes;
    } else {
      // Just single station
      totalsByHour[roundedTime] = bikes;
    }
  });

  const labels = Object.keys(totalsByHour).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );
  const values = labels.map(label => totalsByHour[label]);

  const maxValue = Math.max(...values);
  const suggestedMax = Math.ceil(maxValue * 1.1);
  const suggestedMin = 0;

  const data = {
    labels,
    datasets: [
      {
        label:
          stationName === 'all'
            ? 'Total Free Bikes (All Stations)'
            : `Available Bikes at ${stationName}`,
        data: values,
        borderColor:
          stationName === 'all' ? 'rgb(75, 192, 192)' : 'rgb(255, 159, 64)',
        backgroundColor:
          stationName === 'all'
            ? 'rgba(75, 192, 192, 0.2)'
            : 'rgba(255, 159, 64, 0.2)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const config = {
    type: 'line',
    data,
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text:
            stationName === 'all'
              ? 'Total Free Bikes (Every 2 Hours, Today Only)'
              : `Bike Availability Today (${stationName})`,
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Time (hourly)' },
          ticks: {
            callback: function (value) {
              const label = this.getLabelForValue(value);
              const hour = parseInt(label.split(':')[0], 10);
              return hour % 2 === 0 ? label : '';
            },
          },
        },
        y: {
          beginAtZero: false,
          suggestedMin,
          suggestedMax,
          title: { display: true, text: 'Available Bikes' },
          grid: { drawBorder: false },
        },
      },
    },
  };

  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(document.getElementById('tägliche_tabelle'), config);
}

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
