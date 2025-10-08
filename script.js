console.log("Script loaded successfully.");

// Your labels and data
const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
const data = {
  labels: labels,
  datasets: [{
    label: 'My First Dataset',
    data: [65, 59, 80, 81, 56, 55, 40],
    fill: false,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
};

// Your chart configuration
const config = {
  type: 'line',
  data: data,
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Line Chart'
      }
    }
  }
};

// Wait for DOM to load to safely get the canvas element
window.addEventListener('load', () => {
  const ctx = document.getElementById('weekly-chart').getContext('2d');
  new Chart(ctx, config);
});

fetch('unload.php')
  .then(response => response.json())
  .then(rawData => {
    // 1️⃣ Group by 1-hour rounded time and sum all free bikes
    const totalsByHour = {};

    rawData.forEach(item => {
      const date = new Date(item.created_time);

      // Round down to the current hour
      const roundedHour = date.getHours();
      const roundedTime = `${String(roundedHour).padStart(2, '0')}:00`;

      const freeBikes = Number(item.free_bikes) || 0;

      if (!totalsByHour[roundedTime]) {
        totalsByHour[roundedTime] = 0;
      }
      totalsByHour[roundedTime] += freeBikes;
    });

    // 2️⃣ Sort labels by hour
    const labels = Object.keys(totalsByHour).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    // 3️⃣ Get total bikes for each hour
    const values = labels.map(label => totalsByHour[label]);

    // 4️⃣ Chart data
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Total Free Bikes (per hour)',
          data: values,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          fill: true
        }
      ]
    };

    // 5️⃣ Chart configuration
    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Total Free Bikes per Hour'
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Time (hourly)' },
            ticks: {
              // 🕒 Show only every 2nd label
              callback: function (value, index, ticks) {
                // `value` is index, so use labels array
                const label = this.getLabelForValue(value);
                const hour = parseInt(label.split(':')[0], 10);
                return hour % 2 === 0 ? label : ''; // Show every 2 hours
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

    // 6️⃣ Render chart
    new Chart(document.getElementById('tägliche_tabelle'), config);
  })
  .catch(error => console.error('Error loading data:', error));


