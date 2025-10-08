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
    // 1️⃣ Daten nach created_time gruppieren
    const grouped = {};

    rawData.forEach(item => {
      const time = item.created_time;
      const freeBikes = Number(item.free_bikes) || 0;

      if (!grouped[time]) {
        grouped[time] = 0;
      }
      grouped[time] += freeBikes;
    });

    // 2️⃣ Labels & Werte extrahieren
    const labels = Object.keys(grouped)
      .sort((a, b) => new Date(a) - new Date(b)); // Zeitlich sortieren

    const values = labels.map(label => grouped[label]);

    // 3️⃣ Chart.js-Datenstruktur
    const data = {
      labels: labels,
      datasets: [{
        label: 'Gesamtanzahl freier Fahrräder',
        data: values,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3
      }]
    };

    // 4️⃣ Chart-Konfiguration
    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Freie Fahrräder über den Tag (Summe aller Stationen)'
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Zeit' },
            ticks: {
              callback: function(value, index, ticks) {
                // Nur Stunde:Minute anzeigen
                const label = this.getLabelForValue(value);
                return label.slice(11, 16); // z.B. "11:37"
              }
            }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Anzahl freier Fahrräder' }
          }
        }
      }
    };

    // 5️⃣ Chart zeichnen
    new Chart(document.getElementById('tägliche_tabelle'), config);
  })
  .catch(error => console.error('Fehler beim Laden der Daten:', error));