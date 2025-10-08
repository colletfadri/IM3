console.log("Script loaded successfully.");

fetch('https://im3.probablyaproject.ch/unload.php')
.then(response => response.json())
.then(data => {
    console.log(data);
})
.catch(error => {
    console.error('Error:', error);   
});

fetch('unload.php')
  .then(response => response.json())
  .then(rawData => {
    const labels = rawData.map(item => item.name);
    const values = rawData.map(item => item.free_bikes);

    const data = {
      labels: labels,
      datasets: [{
        label: 'Freie Fahrräder',
        data: values,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3
      }]
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
            text: 'Freie Fahrräder pro Station'
          }
        }
      },
    };

    new Chart(document.getElementById('tägliche_tabelle'), config);
  })
  .catch(error => console.error('Fehler beim Laden der Daten:', error));