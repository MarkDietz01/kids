# Kleuter Digibord

Interactieve digibord-omgeving voor kleuters met drie mini-spelletjes (Kleuren Splash, Vormen Jacht, Tel Tuin) en een uploadbare zoekplaat in een Discord-geïnspireerde dark UI. Voortgang wordt opgeslagen in MariaDB en is te bekijken via de adminpagina.

## Snel starten (zonder Docker)
1. Installeer Node.js 18+ en zorg dat je MariaDB-server beschikbaar is (bijv. op je NAS).
2. Kopieer `.env.example` naar `.env` en vul je MariaDB-host/gebruikersgegevens in.
3. Installeer dependencies en start de server:
   ```bash
   npm install
   npm start
   ```
4. Open <http://localhost:8444> voor de activiteiten en <http://localhost:8444/admin> voor het adminoverzicht.

## Verbinden met bestaande MariaDB
- `DB_HOST` moet verwijzen naar je NAS of andere MariaDB-host (standaard `localhost`).
- De server maakt bij de eerste start automatisch de tabel `child_progress` aan als die nog niet bestaat. Ondersteunt je MariaDB geen `JSON` kolom, vervang `details JSON` in `server.js` door `details TEXT`.
- Standaard inloggegevens staan in `.env.example`; pas ze aan voor productie.

## Configuratie
- `PORT`: poort waarop de Node-app luistert (standaard 8444)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_PORT`: database-parameters voor MariaDB
- `ADMIN_KEY`: sleutel die in de adminpagina ingevuld moet worden om alle kinderen te bekijken (default `admin123`)

## Privacy en fullscreen
- Elke sessie gebruikt een kind-token (`child_token`) zodat kinderen alleen hun eigen resultaten kunnen zien; de adminpagina vraagt altijd om de `ADMIN_KEY`.
- Activiteiten renderen in fullscreen-stijl zodat ze makkelijk zichtbaar zijn op het digibord.

## Zoekplaat activiteit
Upload via de kaart “Zoekplaat” een eigen afbeelding, vul in wat er gezocht moet worden en klik op het doek om het doel te markeren. De gevoeligheid (klikradius) is instelbaar. Als kinderen binnen de radius klikken wordt het gevonden gemarkeerd en weggeschreven naar de database.
