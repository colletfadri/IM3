<?php

$name = "Fadri";
echo $name;

echo '<br>';

$a = 292;
$b = 22;
echo $a + $b;

// -> Functions

function multiply($a, $b) {
    return $a * $b;
}

// echo multiply(234, 181);


echo "\n";


// -> bedingungen
// note muss 4 oder grösser sein um zu bestehen
$note = 3;
if ($note >= 4) {
    echo "Bestanden";
} else if ($note < 4 && $note >= 3.5) {
    echo "Nachprüfung";
} else {
    echo "Nicht Bestanden";
} 

echo "\n";


// -> Arrays
$bananen = ['mama banane', 'papa banane', 'baby banane'];

echo '<pre>';
print_r($bananen);
echo '</pre>';

foreach($bananen as $banane) {
    echo $banane . '<br>';
}


echo "\n";

// -> associative Arrays (aka. objectes)

$standorte = [
    'chur' => 15.4,
    'zurich' => 20,
    'bern' => -1,
];

echo '<pre>';
print_r($standorte ['bern']);
echo '</pre>';

foreach($standorte as $ort => $temperatur) {
    echo $temperatur . '/' . $ort . '<br>';
}
