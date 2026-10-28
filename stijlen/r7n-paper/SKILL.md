---
name: r7n-paper
description: R7N Paper. Lichte, warme reel op beige en wit papier: donkere inkt, oranje accent, rollende cijfers, lijstkaarten met iconen, een notitieblok als terminal en serif-KAPITALEN als accent in de ondertitels. De spreker zit in een papieren kaart onderin. Voor lijstjes en tools ("3 gratis tools die…").
---

# R7N Paper

Volg eerst de werkwijze in `MONTAGE.md` (pad staat in de opdracht). Hieronder wat deze stijl eigen maakt. `template/` is het werkende Remotion-project; de gegevensvorm staat in `src/types.ts` en is gelijk aan die van R7N Signature.

## Lay-outs (`layout` in `src/data/scenes.json`, maten in `src/theme.ts`)

| layout | wanneer | wat je ziet |
|---|---|---|
| `hook` | de eerste zin | titelkaart (`type: "title"`: kop in Geist 800 + oranje blok met serif-KAPITALEN), spreker in de papieren kaart onder; ondertitel op y 1050 |
| `split` | context, lijstpunten, bewijs | kaart boven (x90 y200, 900×740), ondertitel op y 1040, spreker onder (x90 y1300, 900×720, r36) |
| `full` | demo's, het notitieblok, grote lijsten | grote kaart (x90 y230, 900×1060), ondertitel in donkere inkt op y 1430; de spreker schuift weg |
| `close` | de afsluiter | spreker beeldvullend met donker verloop; ondertitel/afsluiter wit op y 1340 |

Beproefde volgorde voor een lijstje: hook → split (teller "3 tools") → full (lijst, punt voor punt op de woorden) → split → full → split → close.

**Overgangen:** lay-outs schuiven in 0,32 s naar elkaar toe; kaarten komen binnen met 60 px omhoog en scherpstelling. Achtergrond: beige papier met fijne vezelstructuur en een zachte oranje hoek rechtsboven.

## Ondertitels (`src/Captions.tsx`)
- Groepen van 1 tot 3 woorden, kleine letters behalve namen, geen leestekens.
- Gewoon woord: Geist 700, 78 px, donkere inkt (wit bij `close`). Accent: Instrument Serif (recht) 104 px in KAPITALEN, donker oranje; 1 à 2 per groep.
- Afsluiter (`>>` in `captions.txt`): regel in serif-cursief, trefwoord in 200 px serif-kapitalen, oranje; blijft staan tot het einde.

## Kaarten (`src/cards/Card.tsx`)
- **`counter`**: rollende cijfers. Elke positie rolt als een tellerwiel naar zijn eindcijfer (Instrument Serif 210 px), de rechter cijfers iets later; `prefix`/`suffix` in donker oranje serif. Zet `start` op het woord waarop het getal valt en `duur` op ±1,6 s.
- **`list`**: titel in serif-KAPITALEN, punten als beige stroken met een oranje icoonvak (nummer of emoji), één voor één op hun woord.
- **`terminal`**: notitieblok op gelinieerd papier met oranje kop; `cmd` typt, `ok` groen, `fout` rood.
- **`image`** en **`browser`**: afbeelding in een papieren kaart met zachte schaduw; camera via `van`/`naar`/`wissel`, markeringen met oranje kader en label.
- **`quote`**: citaat in serif-cursief met groot oranje aanhalingsteken.
- **`title`**: alleen voor de hook.

## Spreker (`src/Speaker.tsx`)
Papieren kaart (beige, dunne rand, zachte schaduw) met een klein oranje tabje linksboven. Ingezoomd op het gezicht via `meta.spreker.focus` en `zoomBox`. Met een uitsnede (`alpha: true`) steekt het hoofd boven de kaart uit. Bij `close` beeldvullend.

## Geluid
Geen muziek of effecten; stem op −14 LUFS via `tools/export.sh`.
