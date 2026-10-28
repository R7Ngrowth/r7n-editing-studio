# R7N Editing Studio: handleiding

Je neemt een video op met je telefoon, met alle takes door elkaar. Je uploadt die ruwe opname in de studio. Claude Code kiest per zin de beste take, knipt de pauzes eruit, zet ondertitels onder je woorden, bouwt kaarten en animaties bij wat je zegt en levert een reel van 1080×1920 op in elke stijl die je aanzet. Je kunt ook je **eigen stijl** laten bouwen uit voorbeeldvideo's.

Alles draait op je eigen Mac, op http://localhost:4242. Gebruik je R7N Mission Control, dan vind je de studio daar onder **Editing Studio**.

## Wat je nodig hebt
- Een **Mac met Apple Silicon** (M1 of nieuwer), macOS 14 of nieuwer, en zo'n 20 GB vrije ruimte.
- **Claude Code** met een Claude-account (Pro, Max of een API-sleutel). Claude doet het werk; dat gebruik telt mee in je abonnement of tegoed. De studio toont achteraf hoelang het duurde en, bij API-gebruik, wat het kostte.
- Een paar gratis programma's (Homebrew, ffmpeg, Node.js, uv, de Xcode-commandoregeltools). Het installatiescript regelt die.

Reken op 15 tot 40 minuten per montage per stijl, en 20 tot 40 minuten per stijl die je laat bouwen.

## 1. Installeren (één keer)
1. Pak de download uit, bijvoorbeeld in Documenten.
2. Dubbelklik op **Installeer.command**. Waarschuwt macOS? Rechtsklik → Open → Open.
3. Het script zet alles klaar (5 tot 15 minuten). Het vraagt soms om je Mac-wachtwoord.

## 2. Inloggen bij Claude (één keer)
1. Open Terminal, typ `claude`, Enter.
2. Typ `/login` en kies je account (abonnement) of de Console (API).
3. Je browser opent; log in en geef toestemming. Zie je de Claude-prompt, typ dan `/exit`.

Rechtsboven in de studio staat een bolletje: groen is ingelogd. Rood? Klik op **Opnieuw controleren**.

## 3. Starten
Dubbelklik op **Start R7N Editing Studio.command**. Laat het Terminal-venster open; je browser opent de studio. Sluit je het venster, dan stopt de studio.

Wil je dat de studio altijd aanstaat, ook na een herstart? Voer dan één keer in Terminal uit:
`zsh scripts/installeer-service.sh`

## 4. Je eigen stijl bouwen (Bouw je stijl)
1. Kies **Mijn eigen edits** (je beste gemonteerde video's) of **Stijl van een concurrent** (schermopnames van reels die je mooi vindt; account en link zijn alleen context voor Claude).
2. Sleep 1 tot 5 video's in het vak. Een schermopname van je telefoon is prima.
3. Geef de stijl een naam en typ of spreek in (🎙) waar Claude op moet letten, bijvoorbeeld "kijk goed naar de cuts in video 2". Die aanwijzingen zijn leidend.
4. Klik op **Bouw mijn stijl**. Claude analyseert lay-out, ritme, ondertitels, kleuren en animaties, bouwt een sjabloon, test het en maakt voorbeeldbeelden. Je kijkt live mee op de stijlkaart.
5. Klaar? De stijl staat bij **Stijlen** en is te kiezen bij Video editen. Onder **Analyse** lees je wat Claude vastlegde.

Bij een concurrent legt Claude alleen de *editingstijl* vast (lay-out, ritme, letters, soorten animaties). Beeld, geluid, teksten en naam van die persoon komen er niet in.

## 5. Een video laten monteren (Video editen)
1. **Opnemen:** rechtop, telefoon op ooghoogte, kijk in de lens. Spreek je script in; meerdere takes per zin mag, Claude kiest de beste.
2. **Uploaden:** sleep de ruwe opname in het vak, of veel korte clips tegelijk (tot 200). De studio zet ze op bestandsnaam, bij telefoonopnames meestal de opnamevolgorde; schuif met ↑ ↓ waar nodig. Claude plakt ze aan elkaar en kiest over alle clips heen de beste takes. Geef per clip aan of het **Ik** is (jouw opname) of **Beeld** (beeldmateriaal, bijv. een schermopname van een tool): beeldmateriaal laat Claude in een kaart, telefoon of laptop zien terwijl jij praat. Liggend gefilmde opnames worden automatisch staand bijgesneden.
3. **Stijlen kiezen:** de drie ingebouwde stijlen staan aan; zet uit wat je niet nodig hebt en klik je eigen stijlen erbij. Elke stijl is een aparte montage (en aparte Claude-tijd).
4. **Aanvullen:** titel, **notities** (typ of klik op 🎙 om in te spreken; je stem wordt op je eigen Mac omgezet naar tekst) (het trefwoord voor "reageer met …", links, wat je wilt benadrukken) en **vaktermen** (namen van tools, zodat de ondertitels ze goed schrijven).
5. Klik op **Start met editen**. Bij **Mijn video's** zie je per stijl wat Claude doet.
6. Klaar? Bekijk, **Download** en lees het **Rapport**: welke takes zijn gekozen, wat er in de ondertitels is aangepast en wat je beter opnieuw opneemt. Niet goed? **Opnieuw**.

## De ingebouwde stijlen

| Stijl | Kenmerken | Goed voor |
|---|---|---|
| **R7N Signature** | donker met oranje accent, jij in een box, kaarten met echte bronnen (screenshots, browser, terminal, tellers), ondertitels woord voor woord met cursieve accenten, gloeiende afsluiter | tech-, AI- en ondernemersnieuws |
| **R7N Paper** | licht en warm als papier, donkere inkt, rollende cijfers, lijstkaarten met iconen, notitieblok, serif-kapitalen | lijstjes en tools ("3 gratis tools…") |
| **R7N Clean** | luchtige Apple-look, veel wit en één blauw accent, 50/50-split, chatpaneel dat meetypt, zachte schaduwen | apps, assistenten en productiviteit |

Alle drie de stijlen kennen dezelfde bouwstenen: tweets, tv/laptop/telefoon-mockups, terminals, tellers, rollende bedragen, logo's die worden doorgestreept, ranglijsten, grote koppen, pixelletters, sneltoetsen, mails, takenlijsten met app-icoontjes en een spraakassistent. Geluidseffecten (whoosh, pop, tick) gaan vanzelf mee.

**Referentie:** zet je eigen voorbeeldbeelden van goede edits in `stijlen/<stijl>/referentiebeelden/`. Claude bekijkt ze bij elke montage, en op de stijlkaart zie je ze onder **Referentie**. Die map gaat nooit mee naar GitHub.

Eigen stijlen bouwt Claude voort op de stijl die er het dichtst bij ligt.

## Instellingen (studio.config.json)
| instelling | betekenis |
|---|---|
| `port` | poort, standaard 4242 |
| `maxParallel` | hoeveel Claude-sessies tegelijk (standaard 2; 1 als je Mac het zwaar heeft) |
| `taal` | taal van je opnames (`nl`, `en`, …) |
| `model` | optioneel een vast Claude-model |
| `claudeToestemming` | `beperkt` (standaard: alleen de commando's die een montage nodig heeft) of `volledig` |
| `toegestaneOrigins` | welke websites de studio vanuit de browser mogen aanspreken (Mission Control) |

## Waar staan mijn bestanden?
- **Video's:** `videos/<datum>/`, per stijl een map met `final.mp4` en `rapport.md`.
- **Stijlen:** `stijlen/<naam>/` met `SKILL.md`, `template/`, `voorbeeld/` en `analyse.md`. Zo'n map kun je delen: zet hem bij iemand anders in `stijlen/`.
- **Verwijderen** zet een map in een prullenbakmap (`.prullenbak-…`) ernaast. Er wordt niets definitief gewist.

## Problemen
- **Claude niet ingelogd:** stap 2 opnieuw.
- **Montage mislukt:** lees de melding op de kaart en klik op Opnieuw. In de map van die stijl staat `claude-log.jsonl` met alles wat Claude deed. Staat daar dat een commando niet mocht? Zet `claudeToestemming` op `volledig`.
- **Mac traag:** `maxParallel` op 1 en de studio herstarten.
- **Onderbroken (studio herstart):** de studio was dicht terwijl Claude werkte. Klik op Opnieuw.
- **Poort bezet:** verander `port`.
- **Mission Control zegt "niet bereikbaar":** de studio draait niet op deze Mac; start hem (stap 3).

## Goed om te weten
- Claude werkt zelfstandig, zonder bij elke stap te vragen, maar alleen in de mappen van de studio. Start de studio alleen op je eigen Mac.
- Geen muziek: die voeg je toe in Instagram of TikTok. Geluidseffecten staan aan; Claude kan ze per video uitzetten als je dat in de notities vraagt.
- Video's worden gemaakt met Remotion: gratis voor particulieren en bedrijven tot drie medewerkers (remotion.dev/license).
