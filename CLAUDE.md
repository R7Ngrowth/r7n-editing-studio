# R7N Editing Studio — instructies voor Claude Code

Dit is **R7N Editing Studio**, een lokale web-app van R7N Growth (Node, zonder pakketten; Remotion in `engine/`). De gebruiker bouwt er editingstijlen mee en laat Claude Code zijn reels monteren: beste take per zin, pauzes eruit, ondertitels, kaarten en animaties, export 1080×1920. Alles draait op de eigen Mac op http://localhost:4242. Mission Control van R7N kan de studio inbedden (CORS, `?embed=1`).

## Als de gebruiker zegt "start de studio" (of "open de localhost")
1. Controleer `engine/node_modules`. Ontbreekt die: `Installeer.command` is nog niet gedraaid; voer `cd engine && npm install` uit en controleer `ffmpeg`, `uv` en `claude` (`which`).
2. Draait de achtergrondservice al? `curl -s localhost:4242/api/status`. Zo ja, open gewoon http://localhost:4242.
3. Anders: start met de previewtool (configuratie `r7n-editing-studio` in `.claude/launch.json`) of `node server.mjs`, en open http://localhost:4242.

## Opbouw
- `server.mjs` + `lib/` — API, uploads, wachtrij (`wachtrij.mjs`), Claude-sessies (`claude.mjs`), stijlen en video's, ffmpeg/whisper (`media.mjs`). Config in `studio.config.json`.
- `public/index.html` — de interface (R7N-huisstijl). `?embed=1` verbergt logo en voettekst.
- `werkwijze/` — wat Claude doet bij monteren (`MONTAGE.md`) en bij een stijl bouwen (`STIJL-BOUWEN.md`).
- `tools/transcribe.py` — spraak naar tekst met woordtijden (mlx-whisper).
- `stijlen/<id>/` — per stijl `SKILL.md`, `stijl.json`, `template/` (Remotion-project met `tools/` voor knippen, ondertitels, stills, export en uitsnede), `voorbeeld/`. Ingebouwd: `r7n-signature`.
- `videos/<id>/` — per upload: de opname, `gedeeld/` (transcript, miniatuur) en per stijl een werkmap met `final.mp4`, `rapport.md`, `claude-log.jsonl`.
- `scripts/installeer-service.sh` — launchd-service `nl.r7ngrowth.editing-studio` zodat de studio altijd draait.

## Belangrijk
- Log nooit zelf in bij Claude en vul geen sleutels in; de gebruiker doet dat in Terminal (`claude` → `/login`).
- `videos/` en `stijlen/*/referentie/` staan in `.gitignore`: opnames blijven lokaal.
- Een nieuwe stijl houdt de gegevensvorm van `src/types.ts` aan, anders werkt `MONTAGE.md` er niet meer op.
- Gebruiksvoorwaarden: `LICENSE.md` (R7N-licentie).
