# Kleuter Digibord

Interactieve digibord-omgeving voor kleuters met drie mini-spelletjes (Kleuren Splash, Vormen Jacht en Tel Tuin) en een uploadbare zoekplaat in een Discord-geïnspireerde dark UI. Voortgang wordt opgeslagen in MariaDB en is te bekijken via de adminpagina.

## Starten met Docker Compose

1. Zorg dat Docker en Docker Compose beschikbaar zijn.
2. De meegeleverde `.env` bevat veilige standaardwaarden, maar is optioneel: zonder `.env` gebruikt Docker Compose automatisch de defaults uit `docker-compose.yml`, zodat je geen ontbrekende-env waarschuwingen krijgt.
3. De `docker-compose.yml` is standaard al gekoppeld aan deze GitHub-repo via een GitHub tarball (`https://codeload.github.com/openai-labs/kids/tar.gz/refs/heads/work`) zodat `git` op de host niet nodig is. Wil je een fork of andere branch gebruiken, zet dan `REPO_CONTEXT` op de gewenste tarball-URL en (optioneel) `DOCKERFILE_PATH` als de mapnaam in het archief verschilt:

   ```bash
   REPO_CONTEXT=https://codeload.github.com/jouw-org/kids/tar.gz/refs/heads/main \
   DOCKERFILE_PATH=kids-main/Dockerfile \
   docker compose up --build
   ```

   Laat je `REPO_CONTEXT` leeg, dan wordt automatisch de standaard GitHub-repo van deze app gebruikt zonder dat `git` op de host aanwezig hoeft te zijn.
4. Open <http://localhost:8444> voor de activiteiten en <http://localhost:8444/admin> voor het adminoverzicht.

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
- `REPO_CONTEXT`: (optioneel) eigen tarball-context voor de Docker-build
- `DOCKERFILE_PATH`: (optioneel) pad naar de Dockerfile binnen het tarball-archief

## Database

Bij het opstarten maakt de server automatisch de tabel `child_progress` aan met kolommen voor kindnaam, kind-token, activiteit, score, details en timestamp. Het kind-token zorgt ervoor dat kinderen alleen hun eigen resultaten kunnen ophalen; de adminpagina gebruikt de `ADMIN_KEY` header.

## Zoekplaat

Upload via de kaart “Zoekplaat” een eigen afbeelding, vul in wat er gezocht moet worden en klik op het doek om het doel te markeren. De gevoeligheid (klikradius) is instelbaar. Als kinderen binnen de radius klikken wordt het gevonden gemarkeerd en weggeschreven naar de database.
