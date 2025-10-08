<?php

require_once 'config.php'; 

header('Content-Type: application/json'.'; charset=utf-8');


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


