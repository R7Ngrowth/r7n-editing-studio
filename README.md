# R7N Editing Studio

**Upload één ruwe opname, krijg een gemonteerde reel terug.** Claude Code kiest per zin je beste take, knipt de pauzes eruit, zet ondertitels onder je woorden, bouwt kaarten en animaties bij wat je zegt en exporteert 1080×1920. Bouw ook je eigen editingstijl uit voorbeeldvideo's. Gemaakt door R7N Growth. Draait op je eigen Mac; je video's blijven bij jou.

## Wat het doet
- **Video editen** — ruwe opname met alle takes erin → per gekozen stijl een kant-en-klare reel, met een rapport (gekozen takes, correcties, wat je beter opnieuw opneemt).
- **Bouw je stijl** — 1 tot 3 voorbeeldvideo's (eigen edits of schermopnames van een concurrent) → een herbruikbare stijl met een werkend sjabloon.
- **R7N Signature** — ingebouwde stijl: donker met oranje accent, jij in een box, kaarten met echte bronnen, woord-voor-woord ondertitels, gloeiende afsluiter.
- **Mission Control** — gebruik je R7N Mission Control, dan zit de studio daar onder *Editing Studio*.

## Starten
1. Pak de download uit en dubbelklik op **Installeer.command** (één keer, 5 à 15 minuten).
2. Log één keer in bij Claude: Terminal → `claude` → `/login`.
3. Dubbelklik op **Start R7N Editing Studio.command**. Je browser opent **http://localhost:4242**.

Altijd aan, ook na een herstart: `zsh scripts/installeer-service.sh` (één keer).

**Werk je met Claude Code?** Open de map in Claude Code en zeg: *"start de studio"*.

## Wat je nodig hebt
| | Waarvoor |
|---|---|
| **Mac met Apple Silicon** (M1+), macOS 14+ | spraakherkenning draait lokaal op de chip |
| **Claude Code** met Pro, Max of API | Claude doet de montage; gebruik telt mee in je abonnement of tegoed |
| **±20 GB vrije ruimte** | video-engine (Remotion), spraakmodel (1,6 GB) en je video's |

Volledige uitleg: **[HANDLEIDING.md](HANDLEIDING.md)**, ook in de studio onder **Handleiding**.

## Hoe het werkt (voor wie wil weten wat er gebeurt)
De studio is een kleine Node-server (`server.mjs`, `lib/`) zonder pakketten. Per upload maakt hij een transcript met woordtijden (mlx-whisper op je Mac) en start hij per stijl een Claude Code-sessie met een vaste werkwijze (`werkwijze/MONTAGE.md`). Elke stijl is een Remotion-project (`stijlen/<id>/template/`) met tools om takes te knippen, ondertitels op woordtijden te zetten, stills te maken en te exporteren. Claude mag standaard alleen de commando's die een montage nodig heeft (`claudeToestemming: beperkt`).

## Je gegevens
Alles staat in `videos/` en `stijlen/` op je eigen Mac. R7N Growth heeft geen toegang. Verwijderen zet iets in een prullenbakmap; er wordt niets definitief gewist.

## Licentie
Gratis te gebruiken voor je eigen video's en je eigen bedrijf, niet door te verkopen. Zie [LICENSE.md](LICENSE.md). Lettertypen onder de SIL Open Font License; Remotion onder zijn eigen licentie (gratis tot drie medewerkers).
