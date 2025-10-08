<?php

require_once 'config.php'; 

// CORS: Erlaube Zugriffe von lokalen Dev-Servern oder passe den Origin an
// Für Produktion solltest du statt '*' eine spezifische Origin verwenden.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
// Bei einer Preflight-OPTIONS-Anfrage genügt eine leere Antwort mit den Headern
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

header('Content-Type: application/json; charset=utf-8');


try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $sql = "SELECT * FROM bike_stations";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $results = $stmt->fetchAll();

    echo json_encode($results);

} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}


