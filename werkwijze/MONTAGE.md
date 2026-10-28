# Een opname monteren: de werkwijze van R7N Editing Studio

Dit is de vaste werkwijze voor elke stijl. Wat de stijl eigen maakt (lay-outs, kaarten, ondertitels) staat in de `SKILL.md` van die stijl; het sjabloon in `template/` is een werkend Remotion-project.

Je werkt zelfstandig: niemand kijkt mee en niemand beantwoordt vragen. Kies zelf, en schrijf elke twijfel in `rapport.md`. Werk alleen in de werkmap uit de opdracht.

## 0. Voortgang melden
Schrijf na elke hoofdstap `voortgang.json` in de werkmap, bijvoorbeeld `{"stap": "Takes kiezen", "procent": 20}`. De studio toont dat live aan de maker. Richtlijn: project 5 · takes 20 · knippen 35 · ondertitels 50 · scènes 65 · controle 80 · export 95 · klaar 100.

## 1. Project klaarzetten
1. Kopieer de inhoud van `template/` van de stijl naar de werkmap (de werkmap wordt het Remotion-project).
2. Koppel de gedeelde installatie: `ln -sfn <ENGINE>/node_modules node_modules`. Installeer niets; alles staat er al.
3. Maak `analyse/` en kopieer het transcript van de ruwe opname (`gedeeld/opname.json` en `transcript.txt`) daarheen, zodat je het bij de hand hebt. Het geluidsspoor maak je met `ffmpeg -i <bron> -vn -ac 1 -ar 16000 analyse/opname.wav`.

## 1b. Meerdere clips (alleen als de opdracht dat zegt)
De maker kan meerdere clips uploaden. De studio heeft ze al gelijkgetrokken; `gedeeld/clips.json` vertelt wat wat is:
- **opname**-clips (de maker zelf) staan in de volgorde van de maker achter elkaar in de bronvideo, met `start` en `eind` in seconden. Het transcript loopt over alle clips heen. Kies takes over alle clips heen; de volgorde van de maker is het uitgangspunt, maar volgt de notities of het verhaal een andere volgorde, dan zet je de takes in `montage.json` in die volgorde (`tools/knippen.py` plakt ze in de volgorde van de lijst).
- **beeld**-clips (beeldmateriaal, bijv. een schermopname) staan in `gedeeld/beeld/clip-NNN.mp4`. Kopieer wat je gebruikt naar `public/beeld/` en toon het met een `clip`-kaart (`kader`: `kaart`, `telefoon`, `laptop` of `vol`; `vanaf` = seconde in de clip waar het fragment begint; `markeer` voor kaders op het belangrijke stuk), of als scherm in een `device`-kaart (een .mp4 als `src` speelt gewoon af). Kies het fragment dat past bij wat de maker op dat moment zegt; bekijk daarvoor frames uit de clip (`ffmpeg -ss … -frames:v 1`). Beeldmateriaal speelt zonder geluid.
- Meld in het rapport welke clips je gebruikte, in welke volgorde, en wat je wegliet.

## 2. Takes kiezen (het belangrijkste werk)
Makers nemen een zin vaak meerdere keren op. Het eindresultaat moet klinken als één vloeiend verhaal.
- **Vind alle takes.** Lees `transcript.txt` en draai `uv run --with numpy python tools/envelope.py analyse/opname.wav` voor de stukken waar gesproken wordt. Whisper plakt takes soms aan elkaar of slaat een stuk over: vergelijk de spraakstukken met het transcript en transcribeer ontbrekende stukken apart (`ffmpeg -ss … -t … -i analyse/opname.wav stuk.wav` en dan `tools/transcribe.py` uit de map `tools/` van de studio).
- **Kies per zin de laatste volledige, vloeiende take.** Afkeuren bij: hapering, herhaling, afgebroken einde, een pauze midden in de zin (whisper maakt dan één woord onnatuurlijk lang), of een blik weg van de lens (maak bij twijfel een frame van beide takes met `ffmpeg -ss <t> -frames:v 1` en vergelijk). Pas daarna let je op woordkeuze.
- **Leg je keuze vast** in `montage.json` (zie `tools/knippen.py`): per take `start`, `eind` en een `noot` met waarom. Laat vóór en na elke take 0,1 à 0,15 s lucht staan en knip nooit midden in een woord.

## 3. Knippen
`uv run --with numpy python tools/knippen.py montage.json` maakt `public/speaker.mp4` en `public/speaker.wav`: de takes achter elkaar, pauzes langer dan 0,3 s ingekort. Bekijk `analyse/cuts.json`.
Transcribeer daarna de gemonteerde stem opnieuw, want daar draaien de ondertitels op: `uv run --with mlx-whisper python <STUDIO>/tools/transcribe.py public/speaker.wav --taal <taal> --termen "<vaktermen>"` → `public/speaker.json`.

## 4. Ondertitels
Schrijf `captions.txt` (uitleg bovenin `tools/captions.py`): één groep per regel, 1 tot 3 woorden, kleine letters behalve namen, geen leestekens. Zet een accent (`*woord*`) op getallen, productnamen, het voordeel en het probleem: hooguit 1 à 2 per groep. Schrijf woorden zoals de maker ze bedoelt; verstond whisper iets anders, koppel dan met `weergave=gehoord`. De afsluiter (`>> reageer met *TREFWOORD*`) blijft tot het einde staan.
Draai `python3 tools/captions.py captions.txt public/speaker.json` en los alle "NIET GEVONDEN"-meldingen op.

## 5. Scènes en kaarten
**Kijk eerst naar het niveau.** Staat er in de stijlmap een map `referentiebeelden/`, bekijk die beelden dan vóór je scènes maakt (Read op de jpg's). Ze laten zien hoe dicht, snel en gevarieerd een goede montage is: elke 1 à 3 seconden een nieuw beeld, ook midden in een zin, met kaarten die precies op hun woord binnenkomen. Neem dat niveau over, niet de kleuren of het beeld zelf. Het volledige voorbeeld van alle kaartsoorten staat in `voorbeeld/demo-scenes.json` van de stijl.

**Wissel genoeg.** Gebruik in een reel van 60 s minstens 20 scènes, met minstens 5 verschillende kaartsoorten, `head` voor korte tussenzinnen en `motion` voor grote animaties. Alle kaartsoorten staan in `src/types.ts`: basis (image, browser, terminal, counter, list, quote, title), social en apparaten (tweet, device), beeldmateriaal van de maker (clip), app-animaties (keys, mail, checklist, voice, ring) en motion graphics (logos, ranking, headline, pixel, toggle, installer). Terminalregels kunnen ook `weg` (doorgestreept) of `balk` (voortgangsbalk met `waarde`) zijn, met een `teller` in de kopbalk.

Vul `src/data/scenes.json`: een lijst van `{start, layout, kaart}` op de woordtijden uit `public/speaker.json`, steeds net vóór het woord waarop het beeld moet wisselen. De lay-outs en kaartsoorten staan in `SKILL.md` en `src/types.ts`. Laat elke markering, teller of regel starten op het woord dat erbij hoort.
Zet in `src/data/meta.json`: `durationInFrames` = duur van `speaker.mp4` × 30 (afgerond naar boven), `titel`, en bij `spreker.focus` waar het gezicht zit (controleer met een still).

**Beeldmateriaal** in `public/beeld/`: echte bronnen gaan voor. Screenshots maak je met headless Chrome (`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --screenshot=public/beeld/x.png --window-size=1200,1600 --force-device-scale-factor=2 <url>`); gebruik officiële afbeeldingen van de productsite; logo's uit simple-icons (CC0). Wat je zelf namaakt, meld je in het rapport. Gebruik nooit beeld of audio uit referentievideo's of referentiebeelden van de stijl, en geen muziek.

## 6. Uitsnede (alleen als de stijl het hoofd boven de box laat uitsteken)
Zie de uitleg bovenin `tools/uitsnede.swift`. Zet daarna `"alpha": true` in `meta.json`. Sla dit over als de opname geen duidelijke persoon toont.

## 7. Controleren
- `node node_modules/typescript/bin/tsc --noEmit -p .` moet schoon zijn.
- Controlebeelden: `node tools/stills.mjs <seconden…> --sheet` en bekijk `out/sheet.jpg` en de losse beelden écht. Let op: afgesneden of overlopende tekst, kaders die niet op hun doel staan, onleesbare screenshots, de kadrering van de spreker (gezicht in beeld, niet afgesneden), ondertitels die over de kaart of de spreker vallen.
- Verbeter en controleer opnieuw tot het klopt.

## 8. Exporteren en eindcontrole
Geluidseffecten gaan vanzelf mee (`src/Geluid.tsx`: whoosh bij elke scène, pop bij lijstpunten en markeringen, tick en ding bij tellers, impact bij een grote kop, op 20%). Zet `"geluid": false` in `meta.json` als de maker geen effecten wil. Het geluid van `final.mp4` moet 48 kHz zijn (`tools/export.sh` regelt dat); controleer met `ffprobe -show_entries stream=sample_rate final.mp4`, want 96 kHz speelt op veel telefoons en in browsers stil af.
`zsh tools/export.sh` rendert en normaliseert naar −14 LUFS → `final.mp4` in de werkmap. Transcribeer `final.mp4` nog één keer en controleer dat geen woord ontbreekt, afgekapt is of dubbel staat. Maak een contactblad van ±12 momenten verspreid over de video en bekijk het.

## 9. Rapport
Schrijf `rapport.md`, kort en in het Nederlands:
- gekozen takes en waarom (en welke je afkeurde);
- correcties in de ondertitels;
- wat je zelf hebt nagebouwd of niet kon vinden;
- wat de maker beter opnieuw kan opnemen;
- overige aandachtspunten.
