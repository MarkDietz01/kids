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
- Activiteiten renderen in fullscreen-stijl zodat ze makkelijk zichtbaar zijn op het digibord.

## Zoekplaat activiteit
Upload via de kaart “Zoekplaat” een eigen afbeelding, vul in wat er gezocht moet worden en klik op het doek om het doel te markeren. De gevoeligheid (klikradius) is instelbaar. Als kinderen binnen de radius klikken wordt het gevonden gemarkeerd en weggeschreven naar de database.
