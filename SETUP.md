# Einrichtung – TJ-Manufaktur Dashboard auf GitHub Pages

Dauer insgesamt ca. 30 Minuten. Laufende Kosten: 0 € – nur der Claude-Assistent kostet
pro Frage ca. 1–2 US-Cent (Anthropic-API, Modell Sonnet 5.5).

## 1. GitHub Pages einschalten (2 Min.)
1. Repository → **Settings → Pages**.
2. *Build and deployment*: Source **Deploy from a branch**, Branch **main**, Ordner **/(root)** → Save.
3. Nach 1–2 Minuten erreichbar unter `https://tj-manufaktur.github.io/<repo-name>/`.
4. Lesezeichen auf PC und Laptop anlegen. Passwort eingeben, bei eigenen Geräten
   „Auf diesem Gerät angemeldet bleiben“ ankreuzen. „Sperren“ (links unten) meldet ab.

## 2. Google-Anmeldung für Gmail, Kalender und Abgleich PC ↔ Laptop (10 Min.)
1. https://console.cloud.google.com → oben **Projekt erstellen** („TJ Dashboard“).
2. **APIs & Dienste → Bibliothek**: *Gmail API*, *Google Calendar API* und *Google Drive API* aktivieren.
3. **APIs & Dienste → OAuth-Zustimmungsbildschirm** (bzw. *Google Auth Platform*):
   Typ **Extern**, App-Name „TJ Dashboard“, deine E-Mail als Support- und Entwickler-Adresse.
   Unter **Zielgruppe / Testnutzer** deine Google-Adresse(n) eintragen. Status bleibt **Test** – das ist für dich allein richtig.
4. **Clients → Client erstellen**: Typ **Webanwendung**,
   *Autorisierte JavaScript-Quellen*: `https://tj-manufaktur.github.io` → Erstellen.
5. Die **Client-ID** (endet auf `.apps.googleusercontent.com`) kopieren und im Dashboard unter
   **Datenquellen & Sicherung → Google OAuth-Client-ID** eintragen → **Mit Google anmelden**.
6. Google zeigt „Diese App wurde nicht von Google überprüft“ → *Weiter* (es ist deine eigene App).
   Angefragt wird: Gmail lesen + Entwürfe anlegen, Kalender lesen, eigener App-Ordner in Drive.
   Es wird nie etwas gesendet oder im Kalender geändert.
7. Kalender-ID: `primary` = Hauptkalender des angemeldeten Google-Kontos. Für einen anderen Kalender
   die ID aus Google Kalender → Einstellungen des Kalenders → *Kalender-ID* eintragen.

Hinweis: Die Google-Anmeldung gilt jeweils ca. 1 Stunde; danach im Dashboard auf
„Mit Google anmelden“ klicken (ohne erneute Zustimmung). Der erste Abgleich auf einem neuen Gerät
übernimmt immer den Stand aus Drive.

## 3. Claude-Assistent (10 Min.)
### a) API-Schlüssel
1. https://console.anthropic.com → Konto anlegen → **Billing**: Guthaben aufladen (z. B. 5 $) und
   unter **Limits** ein monatliches Ausgabelimit setzen (z. B. 5 $).
2. **API Keys → Create Key** („tj-dashboard“) → Schlüssel kopieren (beginnt mit `sk-ant-`).

### b) Cloudflare Worker (du nutzt Cloudflare bereits)
1. https://dash.cloudflare.com → **Workers & Pages → Erstellen → Worker** → Name `tj-dashboard-claude` → Deploy.
2. **Code bearbeiten**: Inhalt von `worker/claude-worker.js` komplett einfügen → **Deploy**.
3. Worker → **Einstellungen → Variablen und Geheimnisse → Hinzufügen**:
   - `ANTHROPIC_API_KEY` – Typ **Geheimnis** – dein `sk-ant-…`-Schlüssel
   - `ACCESS_KEY` – Typ **Geheimnis** – ein langes Zufallspasswort (mind. 24 Zeichen, nur für den Worker)
   - `ALLOWED_ORIGINS` – Typ **Text** – `https://tj-manufaktur.github.io`
4. Worker-Adresse kopieren (`https://tj-dashboard-claude.<name>.workers.dev`).

### c) Im Dashboard
**Claude-Assistent → Zugang auf der GitHub-Seite**: Worker-Adresse und `ACCESS_KEY` eintragen →
„Schlüssel speichern & testen“. Der Zugangsschlüssel bleibt nur auf dem jeweiligen Gerät
(nicht in Drive, nicht auf GitHub) – auf dem Laptop einmal erneut eintragen.

## Sicherheit in Kürze
- GitHub sieht nur die verschlüsselte Seite. Passwort lang halten und nicht weitergeben.
- Der Anthropic-API-Schlüssel liegt nur als Secret im Worker. Der Worker akzeptiert nur Anfragen
  von `tj-manufaktur.github.io` mit dem richtigen `ACCESS_KEY`.
- Passwort ändern / neue Version: Quelldatei mit `DASH_PASSWORD="…" node tools/build.mjs src/dashboard.html index.html`
  neu verschlüsseln und `index.html` ersetzen (oder Claude darum bitten).
