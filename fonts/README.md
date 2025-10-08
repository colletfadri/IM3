Anleitung zum Einfügen der "Harry P" (Harry Potter) Font

Platzierung der Dateien
- Lege die Font-Dateien in dieses Verzeichnis: `fonts/` im Projekt-Root.
- Benenne die Dateien wie im CSS referenziert: `harryp.woff2`, `harryp.woff`, `harryp.ttf`.

Beispiel für die Dateistruktur:

IM3-Velo/
├─ fonts/
│  ├─ harryp.woff2
│  ├─ harryp.woff
│  └─ harryp.ttf
├─ style.css
└─ index.html

Hinweis zur Lizenz
- Stelle sicher, dass du die Rechte zur Nutzung und Verbreitung der Schrift hast.
- Viele "Harry Potter"-Stile sind urheberrechtlich geschützt bzw. Fan-Designs mit speziellen Lizenzen.
- Lade die Dateien nicht in ein öffentliches Repository hoch, wenn die Lizenz das verbietet.

Verwendung in CSS/HTML
- In `style.css` ist bereits ein `@font-face` für die Schrift `HarryP` definiert.
- Beispiel: wende die Schrift auf ein Element an:

  <h1 class="harry-font">Willkommen in Hogwarts</h1>

- Oder global z. B. für Überschriften (auskommentiert in `style.css`):

  h1 { font-family: 'HarryP', Georgia, serif; }

Wenn du andere Dateinamen oder Pfade verwenden willst
- Passe die `src: url(...)`-Pfade in `style.css` an die tatsächlichen Dateinamen/Pfade an.

Testen
- Öffne `index.html` im Browser (lokal) und füge eine Überschrift mit der Klasse `harry-font` hinzu.
- Lade die Seite neu; wenn die Schrift nicht angezeigt wird, öffne die Dev-Tools (F12) und prüfe die Netzwerk- und Console-Tab auf 404-Fehler oder CORS/Font-Fehler.

Kontakt
- Sag Bescheid, wenn ich die Fonts direkt hochladen oder die CSS-Regeln auf bestimmte Elemente anwenden soll.