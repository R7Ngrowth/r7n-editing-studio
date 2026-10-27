#!/bin/zsh
# Dubbelklik om R7N Editing Studio te starten. Laat dit venster open; sluiten = studio stoppen.
cd "${0:A:h}"
export PATH="$HOME/.local/bin:/opt/homebrew/bin:$PATH"
clear
print -P "%B%F{208}R7N%f Editing Studio%b\n"
if [[ ! -d engine/node_modules ]]; then
  print "De studio is nog niet geïnstalleerd. Dubbelklik eerst op Installeer.command."
  read -k1 "?Druk op een toets om te sluiten."; exit 1
fi
PORT=$(node -e "try{console.log(require('./studio.config.json').port||4242)}catch{console.log(4242)}")
if curl -fs "http://localhost:$PORT/api/status" >/dev/null 2>&1; then
  print "De studio draait al (achtergrondservice). Je browser opent zo."
  sleep 1; open "http://localhost:$PORT"; sleep 2; exit 0
fi
print "De studio start op http://localhost:$PORT. Stoppen: sluit dit venster.\n"
(sleep 1.5; open "http://localhost:$PORT") &
node server.mjs
