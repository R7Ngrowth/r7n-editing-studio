---
name: r7n-clean
description: R7N Clean. Luchtige Apple-achtige reel: veel wit, één blauw accent (#5b74ff), 50/50-split met een kaart boven en de spreker in een grote afgeronde kaart onder, zachte brede schaduwen, een chatpaneel dat meetypt, 3D-achtige iconen en ronde knoppen. Witte ondertitels over de spreker. Voor apps, assistenten en productiviteit.
---

# R7N Clean

Volg eerst de werkwijze in `MONTAGE.md` (pad staat in de opdracht). Hieronder wat deze stijl eigen maakt. `template/` is het werkende Remotion-project; de gegevensvorm staat in `src/types.ts` en is gelijk aan die van R7N Signature.

## Lay-outs (`layout` in `src/data/scenes.json`, maten in `src/theme.ts`)

| layout | wanneer | wat je ziet |
|---|---|---|
| `hook` | de eerste zin | titelkaart (`type: "title"`: kop in Geist 800 + blauwe ronde pil) boven, spreker onder; ondertitel wit over de spreker op y 1640 |
| `split` | bijna alles | 50/50: kaart boven (x80 y140, 920×800), spreker onder (x80 y1000, 920×800, r56), ondertitel wit over het onderste deel van de spreker (y 1640) |
| `full` | demo's, lange chats, grote screenshots | grote kaart (x80 y140, 920×1300) op wit, ondertitel in donkere inkt op y 1560; de spreker schuift weg |
| `close` | de afsluiter | spreker beeldvullend met donker verloop; ondertitel/afsluiter wit op y 1340 |

Beproefde volgorde: hook → split → split → full → split → split → close. Deze stijl blijft rustig: wissel vooral de kaart, niet steeds de lay-out.

**Overgangen:** lay-outs schuiven in 0,32 s naar elkaar toe; kaarten komen binnen met 60 px omhoog en scherpstelling. Achtergrond: wit met een heel zachte blauwe waas bovenin.

## Ondertitels (`src/Captions.tsx`)
- Groepen van 1 tot 3 woorden, kleine letters behalve namen, geen leestekens.
- Over de spreker (`hook`, `split`, `close`): Geist 700, 76 px, wit met zachte schaduw; accent Instrument Serif Italic 96 px in lichtblauw. Bij `full`: donkere inkt, accent in blauw.
- Afsluiter (`>>` in `captions.txt`): regel in Geist 500, trefwoord als grote blauwe ronde knop (Geist 700, 150 px, wit); blijft staan tot het einde.

## Kaarten (`src/cards/Card.tsx`)
- **`terminal`** is hier een **chatpaneel**: `cmd`-regels typen mee als blauwe vraag rechts, `uit`/`ok`/`fout` verschijnen als witte antwoordkaartjes links. Gebruik het voor "typ dit in de app"-momenten.
- **`list`**: punten als lichte stroken met een 3D-achtig icoonvak (wit-blauw verloop), die één voor één inschuiven.
- **`counter`**: groot getal in Geist 800, blauw als hij klaar is; label als ronde pil.
- **`image`** en **`browser`**: afbeelding in een witte kaart met brede zachte schaduw; browserbalk met gecentreerde url; camera via `van`/`naar`/`wissel`, markeringen met blauw kader.
- **`quote`**: citaat in Geist 600 met blauw aanhalingsteken.
- **`title`**: alleen voor de hook (witte kaart met licht verloop).

## Spreker (`src/Speaker.tsx`)
Grote afgeronde kaart (r56) met brede zachte schaduw, zonder rand; onderin een donker verloop zodat de witte ondertitel leesbaar blijft. Ingezoomd via `meta.spreker.focus` en `zoomBox`. Met een uitsnede (`alpha: true`) steekt het hoofd boven de kaart uit. Bij `close` beeldvullend.

## Extra elementen (in alle R7N-stijlen, `src/cards/Extra.tsx`)
Deze stijl is de R7N-tegenhanger van een luchtige app-stijl. Ondertitels staan per groep in een donker half-doorzichtig blokje; de achtergrond heeft langzaam bewegende perzik- en blauwe vlekken. Gebruik vooral:
- **`voice`**: donker assistent-paneel met gloeiende bol, geluidsgolf, statuspil ("Luistert…" → "Klaar" op `klaar`) en tekst die meetypt. Sterk als hook.
- **`keys`**: witte 3D-toetsen die op hun woord indrukken met een rimpeling (sneltoetsen).
- **`mail`**: e-mail met een `antwoord` dat meetypt.
- **`checklist`**: takenlijst ("Vandaag") met afvinken (`af`) en zwevende app-icoontjes eromheen die op slot gaan (`slot`).
- **`ring`**: draaiende ring met de productnaam letter voor letter en toetsen eronder.
- **`terminal`** is hier een chatpaneel; `motion` voor grote animaties, `head` voor tussenzinnen.
Zie `voorbeeld/demo-scenes.json` voor een volledig voorbeeld.

## Referentie
Staat er een map `referentiebeelden/` in deze stijlmap, bekijk die eerst: zo dicht en snel moet de montage zijn.

## Geluid
Geluidseffecten gaan vanzelf mee (`src/Geluid.tsx`, eigen geluiden in `public/sfx`, op 20%): whoosh bij elke scène, pop bij lijstpunten, tick en ding bij tellers. Uitzetten met `"geluid": false` in `meta.json`. Geen muziek: die voegt de maker toe in Instagram of TikTok. Stem op −14 LUFS en 48 kHz via `tools/export.sh`.
