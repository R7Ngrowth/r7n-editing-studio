---
name: r7n-signature
description: R7N Signature. Donkere reel met oranje accent: de spreker in een afgeronde box onderin, daarboven een kaart met echte bronnen (screenshot, browser, terminal, teller, lijst, citaat), ondertitels die woord voor woord opbouwen met cursieve serif-accenten, en een beeldvullende afsluiter met gloeiend trefwoord. Voor tech-, AI- en ondernemersnieuws.
---

# R7N Signature

Volg eerst de werkwijze in `MONTAGE.md` (pad staat in de opdracht). Hieronder wat deze stijl eigen maakt. `template/` is het werkende Remotion-project; de gegevensvorm staat in `src/types.ts`.

## Lay-outs (`layout` in `src/data/scenes.json`, maten in `src/theme.ts`)

| layout | wanneer | wat je ziet |
|---|---|---|
| `hook` | de eerste zin | titelkaart (`type: "title"`: kop in Geist 800 + oranje blok met serif-cursief) boven, spreker in de box onder; ondertitel op y 1050 |
| `split` | context, bewijs, "wie/wat" | kaart boven (x90 y220, 900×720), ondertitel op y 1040, spreker in de box (x76 y1300, 928×720, r80) |
| `full` | demo's, "hoe het werkt", actie | grote kaart (x90 y250, 900×1040) op de donkere achtergrond, ondertitel op y 1430; de box schuift naar beneden weg |
| `close` | de afsluiter | spreker beeldvullend, ingezoomd op het gezicht (`meta.spreker.zoomClose`), ondertitel/afsluiter op y 1340 |

Beproefde volgorde: hook → full → split → full → full → split → full → split → close. Wissel ook midden in zinnen, op het woord waar het beeld bij hoort.

**Overgangen:** lay-outs schuiven in 0,32 s naar elkaar toe; elke kaart komt binnen met 60 px omhoog, schaal 0,94 → 1 en scherpstelling. De eerste 5 frames faden in vanuit de achtergrond.

## Ondertitels (`src/Captions.tsx`)
- Groepen van 1 tot 3 woorden, kleine letters behalve namen, geen leestekens.
- Woorden verschijnen één voor één (0,14 s: transparantie, 14 px omhoog, scherpstelling); de regel staat gecentreerd.
- Gewoon woord: Geist 700, 80 px, bijna wit. Accent: Instrument Serif Italic 98 px met oranje verloop en gloed; 1 à 2 per groep, op getallen, namen, het voordeel en het probleem.
- Afsluiter (`>>` in `captions.txt`): regel in witte serif-cursief, daaronder het TREFWOORD in 190 px oranje met gloed; blijft staan tot het einde.

## Kaarten (`src/cards/Card.tsx`, soorten in `src/types.ts`)
- **`image`** en **`browser`**: afbeelding uit `public/beeld/` in een kader met oranje gloed; `van`/`naar`/`wissel` voor een camerabeweging naar het detail; `markeer` voor oranje kaders met label op het woord dat erbij hoort. Browser heeft een Safari-achtige balk met de url.
- **`terminal`**: regels verschijnen op hun seconde; `cmd` typt, `ok` groen vinkje, `fout` rood kruis, `uit` gedempt.
- **`counter`**: badge met label en een getal dat optelt (nl-NL), oranje verloop als hij klaar is.
- **`list`**: titel in serif-cursief en punten die één voor één inschuiven, met nummer of icoon.
- **`quote`**: groot citaat in serif-cursief met bron.
- **`title`**: alleen voor de hook.

## Spreker (`src/Speaker.tsx`)
In de box ingezoomd op het gezicht (`meta.spreker.focus`, `zoomBox`). Met een uitsnede (`alpha: true`, zie `tools/uitsnede.swift`) steekt het hoofd boven de box uit. Bij `close` beeldvullend met een donker verloop onderaan voor de afsluiter.

## Extra elementen (in alle R7N-stijlen, `src/cards/Extra.tsx`)
Deze stijl is de R7N-tegenhanger van een AI-nieuwsstijl. Gebruik vooral:
- **`tweet`**: post met naam, handle en vinkje; `markeer` veegt een oranje markering over een zin op zijn woord, `kader` zet er een rood kader om. Ideaal als bron bij nieuws.
- **`device`** (`tv`, `laptop`, `telefoon`): mockup met schermen die op hun seconde wisselen (vervaging) en een witte `pil` eronder.
- **`terminal`** met `weg`-regels (rood doorgestreept), `balk`-regels (voortgangsbalk met getal) en een `teller` rechtsboven ("takes 6/6").
- **`head`**: korte tussenzin met de spreker beeldvullend; **`motion`**: grote animatie zonder kader (bijv. `headline`, `logos`).
Zie `voorbeeld/demo-scenes.json` voor een volledig voorbeeld.

## Referentie
Staat er een map `referentiebeelden/` in deze stijlmap, bekijk die eerst: zo dicht en snel moet de montage zijn.

## Geluid
Geluidseffecten gaan vanzelf mee (`src/Geluid.tsx`, eigen geluiden in `public/sfx`, op 20%): whoosh bij elke scène, pop bij lijstpunten, tick en ding bij tellers. Uitzetten met `"geluid": false` in `meta.json`. Geen muziek: die voegt de maker toe in Instagram of TikTok. Stem op −14 LUFS en 48 kHz via `tools/export.sh`.
