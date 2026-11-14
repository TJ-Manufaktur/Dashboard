# TJ-Manufaktur Dashboard (geschützt)

Internes Dashboard für TJ-Manufaktur. `index.html` ist mit AES-256-GCM verschlüsselt
(Schlüssel per PBKDF2-SHA-256, 600.000 Runden, aus dem Passwort abgeleitet). Ohne Passwort ist
nur die Anmeldemaske sichtbar. **In diesem Repository liegen keine Geschäftsdaten** – Aufträge,
Anfragen und Einstellungen liegen im Browser und (nach Google-Anmeldung) in einem privaten
App-Ordner im Google Drive des Inhabers.

- `index.html` – verschlüsselte Seite (GitHub Pages)
- `worker/claude-worker.js` – Cloudflare Worker für den Claude-Assistenten (API-Schlüssel nur als Worker-Secret)
- `SETUP.md` – Einrichtung (GitHub Pages, Google-Anmeldung, Claude-Worker)
