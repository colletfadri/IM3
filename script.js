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



