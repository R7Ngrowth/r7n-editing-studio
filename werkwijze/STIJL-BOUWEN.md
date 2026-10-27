# Een nieuwe editingstijl bouwen: de werkwijze van R7N Editing Studio

Je maakt van één of meer referentievideo's een herbruikbare stijl: een map met `SKILL.md`, een werkend Remotion-sjabloon in `template/`, voorbeeldbeelden in `voorbeeld/` en je bevindingen in `analyse.md`. Daarna monteert de studio elke nieuwe opname in deze stijl, volgens `MONTAGE.md`.

Je werkt zelfstandig: stel geen vragen, kies zelf en noteer twijfels in `analyse.md`. Werk alleen in de stijlmap uit de opdracht. Meld voortgang in `voortgang.json` (`{"stap": "...", "procent": n}`).

**Twee soorten referenties:**
- **eigen**: de maker uploadt zijn of haar eigen edits. Leg de stijl zo precies mogelijk vast.
- **concurrent**: schermopnames van iemand anders. Leg alleen de *editingstijl* vast: lay-out, ritme, typografie, soorten animaties. Neem nooit beeld, audio, teksten, logo's of de naam van die persoon over. De stijlnaam en `SKILL.md` noemen geen personen of accounts.

## 1. Analyseren
De video's staan in `referentie/`.
- Per video: frames op 4 per seconde (`ffmpeg -i x.mp4 -vf fps=4,scale=300:-2 analyse/x-%03d.jpg`) en een contactblad (`uv run --with pillow python <basis>/tools/sheet.py analyse/x-sheet.jpg analyse/x-*.jpg`); grotere losse frames (±600 px) op momenten waar de lay-out wisselt; een transcript via `<STUDIO>/tools/transcribe.py`.
- Schermopnames van een telefoon: reken de app-interface (knoppen, statusbalk) eruit en vertaal naar 1080×1920.
- Leg vast in `analyse.md`: lay-outs (soorten beeld, verhoudingen en posities in pixels, waar de spreker staat), ritme (hoe vaak en wanneer er gewisseld wordt, harde cuts of overgangen), ondertitels (letter, gewicht, grootte, kleur, positie, woorden per groep, opbouw, accenten), kleur en achtergrond (hex), vaste elementen (soorten animaties, iconen, tellers, kaarten), hook en afsluiter, geluid.

## 2. Bouwen
- **Vertrekpunt:** kopieer `template/` van de ingebouwde stijl die er het dichtst bij ligt (lees de `SKILL.md`'s in `<STUDIO>/stijlen/`) naar `template/` in je stijlmap. Koppel: `ln -sfn <ENGINE>/node_modules template/node_modules`.
- **Pas de code aan tot het de nieuwe stijl is:** `src/theme.ts` (kleuren, letters, lay-outmaten), `src/Captions.tsx` (ondertitels), `src/cards/` (voeg kaarten toe die bij de stijl horen, verwijder wat niet past), `src/Speaker.tsx` (box, uitsnede, beeldvullend) en `src/Reel.tsx` (overgangen).
- **Lettertypen:** alleen vrij te gebruiken letters (OFL), uit `github.com/google/fonts`, in `template/public/fonts`, geladen via `src/fonts.ts`.
- **Houd de gegevensvorm gelijk** (`src/types.ts`: scènes, kaarten, ondertitels, meta) zodat `MONTAGE.md` en de tools blijven werken. Nieuwe kaartsoorten voeg je toe aan `types.ts` én `cards/Card.tsx`.

## 3. Controleren
Je hebt geen opname van de maker. Maak een korte proefversie: 8 à 12 s uit een referentievideo (`ffmpeg -ss … -t …`) als tijdelijke `public/speaker.mp4`, transcribeer die naar `public/speaker.json`, vul `captions.txt`, `scenes.json` en `meta.json` met een paar scènes van elke lay-out, en render stills (`node tools/stills.mjs … --sheet`). Vergelijk naast de referentie en pas aan tot lay-out, typografie en kleur kloppen. `tsc --noEmit` moet schoon zijn. Verwijder de proefmedia daarna uit `template/public` (de referentie hoort niet in het sjabloon).

## 4. Opleveren
- **`SKILL.md`:** frontmatter met `name` (de id) en een `description` van 2 à 3 zinnen; daarna in de opbouw van de ingebouwde stijlen: lay-outtabel met maten, typische volgorde, overgangen, ondertitels, kaartsoorten met hun bestanden. Verwijs voor de werkwijze naar `MONTAGE.md`.
- **`voorbeeld/`:** 4 representatieve frames (360 px breed). Bij een eigen stijl uit de referentie zelf; bij een concurrent uit je proefversie, nooit uit de video van de concurrent.
- **`analyse.md`:** je bevindingen uit stap 1.
- **`stijl.json`:** vul `beschrijving` (één zin voor de stijlkaart, zonder namen van personen), `voorbeelden` (bestandsnamen in `voorbeeld/`) en `kenmerken` (3 tot 5 trefwoorden). Laat `id`, `naam`, `type` en `status` staan; de studio zet de status.
