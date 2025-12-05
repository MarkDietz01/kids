# Kleuter Digibord

Interactieve digibord-omgeving voor kleuters met drie mini-spelletjes (Kleuren Splash, Vormen Jacht en Tel Tuin) en een uploadbare zoekplaat in een Discord-geïnspireerde dark UI. Voortgang wordt opgeslagen in MariaDB en is te bekijken via de adminpagina.

## Starten met Docker Compose

1. Zorg dat Docker en Docker Compose beschikbaar zijn.
2. Wil je alleen deze `docker-compose.yml` gebruiken en de code rechtstreeks uit GitHub laten trekken? Zet dan `REPO_CONTEXT` op de GitHub-URL van dit project (bijv. `export REPO_CONTEXT=https://github.com/jouw-org/kids.git`) en start daarna de compose:

   ```bash
   REPO_CONTEXT=https://github.com/jouw-org/kids.git docker compose up --build
   ```

   Laat je `REPO_CONTEXT` leeg, dan bouwt Compose vanuit de huidige map `.`.
3. Open <http://localhost:8444> voor de activiteiten en <http://localhost:8444/admin> voor het adminoverzicht.

## Verbinden met een bestaande MariaDB (bijv. NAS)

1. Kopieer `.env.example` naar `.env` en vul de host, poort en gebruikersgegevens van je NAS in.
2. Start de app lokaal met `npm install` en daarna `npm start` (of met Docker Compose waarbij de `app`-service je `.env` gebruikt).
3. De server maakt de tabel `child_progress` automatisch aan als die nog niet bestaat.

> Tip: als je NAS geen `JSON` kolom ondersteunt, pas de `details` kolom aan naar `TEXT` in `server.js`.

## Configuratie

De volgende omgevingsvariabelen kunnen naar wens worden aangepast (zie `docker-compose.yml`):
- `PORT`: poort waarop de Node-app luistert (standaard 8444)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_PORT`: database-parameters voor MariaDB
- `ADMIN_KEY`: sleutel die in de adminpagina ingevuld moet worden om alle kinderen te bekijken (default `admin123`)

## Database

Bij het opstarten maakt de server automatisch de tabel `child_progress` aan met kolommen voor kindnaam, kind-token, activiteit, score, details en timestamp. Het kind-token zorgt ervoor dat kinderen alleen hun eigen resultaten kunnen ophalen; de adminpagina gebruikt de `ADMIN_KEY` header.

## Zoekplaat

Upload via de kaart “Zoekplaat” een eigen afbeelding, vul in wat er gezocht moet worden en klik op het doek om het doel te markeren. De gevoeligheid (klikradius) is instelbaar. Als kinderen binnen de radius klikken wordt het gevonden gemarkeerd en weggeschreven naar de database.
