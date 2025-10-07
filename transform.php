<?php

$data = include 'extract.php';

if (!$data || !isset($data['network']['stations'])) {
    die("❌ Fehler: Keine gültigen Stationsdaten von extract.php erhalten.\n");
}

$stations = $data['network']['stations'];
$transformedData = [];

// === Daten transformieren ===
foreach ($stations as $station) {


    // Array mit Spaltennamen wie in der Zieltabelle
    $transformedData[] = [
        'name'        => $station['name'],
        'latitude'    => (float)$station['latitude'],
        'longitude'   => (float)$station['longitude'],
        'free_bikes'  => (int)$station['free_bikes'],
        'empty_slots' => (int)($station['empty_slots'] ?? 0)
    ];
}

// print_r($transformedData);

// Gib die transformierten Daten als JSON zurück
return $transformedData;