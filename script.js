// -------------------- tägliche tabelle --------------------

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


// -------------------- wöchentliche tabelle --------------------

let weeklyChart = null;
let weeklyData = [];

fetch('unload.php')
  .then(response => response.json())
  .then(rawData => {
    weeklyData = rawData;

    // Get all unique station names
    const stationNames = [...new Set(rawData.map(item => item.name))];

    const select = document.getElementById('stationSelectWeekly');
    stationNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });

    // Initialize chart with all stations
    updateWeeklyChart("");

    // Update chart when station changes
    select.addEventListener('change', () => {
      updateWeeklyChart(select.value);
    });
  })
  .catch(error => console.error('Error loading weekly data:', error));

function updateWeeklyChart(selectedStation) {
  const filteredData = selectedStation
    ? weeklyData.filter(item => item.name === selectedStation)
    : weeklyData;

  const totalsByDay = {};
  const countsByDay = {};

  // Group by weekday and sum bikes
  filteredData.forEach(item => {
    const date = new Date(item.created_time);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const freeBikes = Number(item.free_bikes) || 0;

    if (!totalsByDay[weekday]) {
      totalsByDay[weekday] = 0;
      countsByDay[weekday] = 0;
    }

    totalsByDay[weekday] += freeBikes;
    countsByDay[weekday] += 1;
  });

  // Calculate averages
  const averageByDay = {};
  Object.keys(totalsByDay).forEach(day => {
    averageByDay[day] = totalsByDay[day] / countsByDay[day];
  });

  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const labels = dayOrder.filter(day => averageByDay[day] !== undefined);
  const values = labels.map(day => averageByDay[day].toFixed(1));

  const data = {
    labels: labels,
    datasets: [
      {
        label: selectedStation
          ? `Ø Bikes @ ${selectedStation}`
          : "Ø Total Bikes (All Stations)",
        data: values,
        borderColor: 'var(--hufflepuff-yellow)',
        backgroundColor: 'rgba(233, 186, 75, 0.2)',
        fill: true,
        tension: 0.35,
        pointRadius: 5,
        pointBackgroundColor: 'var(--slitheryn-dark-green)',
      },
    ],
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: selectedStation
            ? `Wöchentliche Übersicht – ${selectedStation}`
            : "Wöchentliche Übersicht – Alle Stationen",
          font: { size: 16 },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Wochentage' },
        },
        y: {
          beginAtZero: false,
          min: Math.min(...values) * 0.8,
          max: Math.max(...values) * 1.2,
          title: { display: true, text: 'Ø Freie Fahrräder' },
        },
      },
    },
  };

  // Destroy previous chart before creating new one
  if (weeklyChart) {
    weeklyChart.destroy();
  }

  weeklyChart = new Chart(document.getElementById('wochentliche_tabelle'), config);
}

// ------------------- Map Section -------------------

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

// ------------------ monatliche tabelle --------------------
let monthlyChartInstance = null;
let monthlyAllData = [];

fetch('unload.php')
  .then(response => response.json())
  .then(rawData => {
    monthlyAllData = rawData;

    // Populate dropdown with station names
    const stationSelect = document.getElementById('stationSelectMonthly');
    const uniqueStations = [...new Set(rawData.map(item => item.name))];

    uniqueStations.forEach(station => {
      const option = document.createElement('option');
      option.value = station;
      option.textContent = station;
      stationSelect.appendChild(option);
    });

    // Set initial chart with the first station
    if (uniqueStations.length > 0) {
      createMonthlyChart(uniqueStations[0]);
    }

    // Update chart on dropdown change
    stationSelect.addEventListener('change', (event) => {
      const selectedStation = event.target.value;
      createMonthlyChart(selectedStation);
    });
  })
  .catch(error => console.error('Error loading data:', error));

function createMonthlyChart(selectedStation) {
  // Filter data for the selected station
  const stationData = monthlyAllData.filter(item => item.name === selectedStation);

  // Group by day (YYYY-MM-DD) and calculate average bikes per day
  const totalsByDay = {};
  const countsByDay = {};

  stationData.forEach(item => {
    const date = new Date(item.created_time);
    const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const freeBikes = Number(item.free_bikes) || 0;

    if (!totalsByDay[dayKey]) {
      totalsByDay[dayKey] = 0;
      countsByDay[dayKey] = 0;
    }

    totalsByDay[dayKey] += freeBikes;
    countsByDay[dayKey]++;
  });

  // Calculate averages
  const labels = Object.keys(totalsByDay).sort();
  const averages = labels.map(day => totalsByDay[day] / countsByDay[day]);

  // Destroy old chart instance if it exists
  if (monthlyChartInstance) {
    monthlyChartInstance.destroy();
  }

  // Create chart data
  const data = {
    labels: labels,
    datasets: [
      {
        label: `Ø freie Fahrräder (${selectedStation})`,
        data: averages,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  // Chart configuration
  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: `Durchschnittliche Anzahl freier Fahrräder (${selectedStation}) pro Tag`
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Tag' },
          ticks: {
            maxTicksLimit: 10, // prevents overcrowding
            callback: function (value, index) {
              const label = this.getLabelForValue(value);
              // Format YYYY-MM-DD → show only day number
              return label.slice(8); // "07" from "2025-10-07"
            }
          }
        },
        y: {
          beginAtZero: false,
          suggestedMin: 0,
          suggestedMax: Math.max(...averages) * 1.2, // give some breathing space
          title: { display: true, text: 'Ø Freie Fahrräder' }
        }
      }
    }
  };

  // Render chart
  const ctx = document.getElementById('monatliche_tabelle').getContext('2d');
  monthlyChartInstance = new Chart(ctx, config);
}