# Kleuter Digibord

Interactieve digibord-omgeving voor kleuters met drie mini-spelletjes (Kleuren Splash, Vormen Jacht, Tel Tuin) en een uploadbare zoekplaat in een Discord-geïnspireerde dark UI. Voortgang wordt nu opgeslagen in een lokale SQLite-database via een Python-backend.

## Snel starten (Python, zonder Docker)
1. Installeer Python 3.10+.
2. (Optioneel) Kopieer `.env.example` naar `.env` om poort, admin-sleutel of databasepad aan te passen.
3. Installeer dependencies en start de server:
   ```bash
   python -m pip install -r requirements.txt
   python app.py
   ```
4. Open <http://localhost:8444> voor de activiteiten en <http://localhost:8444/admin> voor het adminoverzicht.

## Configuratie
- `PORT`: poort waarop de Python-app luistert (standaard 8444)
- `DB_PATH`: pad naar het SQLite-bestand (standaard `kids.db` in de projectmap)
- `ADMIN_KEY`: sleutel die in de adminpagina ingevuld moet worden om alle kinderen te bekijken (default `admin123`)

## Privacy en fullscreen
- Elke sessie gebruikt een kind-token (`child_token`) zodat kinderen alleen hun eigen resultaten kunnen zien; de adminpagina vraagt altijd om de `ADMIN_KEY`.
- Activiteiten renderen in fullscreen-stijl zodat ze makkelijk zichtbaar zijn op het digibord. De zoekplaat verbergt alle bediening en tags tijdens fullscreen, zodat alleen de plaat zichtbaar is voor de kinderen.
- Tags/markeringen op de zoekplaat zijn standaard verborgen; activeer **Admin-tags** met de admin-sleutel om de posities en labels te tonen voor leerkrachten.

## Zoekplaat activiteit
Upload via de kaart “Zoekplaat” een eigen afbeelding, vul in wat er gezocht moet worden en klik op het doek om het doel te markeren. De gevoeligheid (klikradius) is instelbaar. Als kinderen binnen de radius klikken wordt het gevonden gemarkeerd en weggeschreven naar de database.

- Klik **Admin-tags** en vul de admin-sleutel in als je als leerkracht alle tags wilt zien, labels controleren of op het digibord wilt uitleggen wat er gezocht moet worden.
- In fullscreen toont de zoekplaat alleen het doek; schakel Admin-tags in voordat je fullscreen gaat als je de markeringen zelf wilt bekijken.

### Kaarten ontwerpen en bewaren
- Zet **Bewerk-modus** aan om punten op de kaart te verslepen of te verwijderen.
- Vul een kaartnaam en admin-sleutel in en klik **Sla kaart op** om de afbeelding + puntenconfiguratie in SQLite te bewaren.
- Gebruik de selectielijst om eerder opgeslagen kaarten te laden en opnieuw in fullscreen te gebruiken met de kinderen.

## API
- `/api/health` — geeft `ok: true` wanneer de SQLite database bereikbaar is.
- `/api/progress` (POST) — slaat rondes op met `childName`, `childToken`, `activity`, `score`, `details`.
- `/api/children/:name` (GET) — alleen voor het eigen `x-child-token`, retourneert de rondes van dat kind.
- `/api/admin/progress` (GET) — adminoverzicht, vereist header `x-admin-key` (default `admin123`).
- `/api/activities` (GET/POST) — lijst of bewaar zoekplaatkaarten. POST accepteert optioneel `id` (voor updates) en vereist `x-admin-key`.
