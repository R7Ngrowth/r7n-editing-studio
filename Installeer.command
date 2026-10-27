#!/bin/zsh
# R7N Editing Studio — eenmalige installatie. Dubbelklik om te starten (rechtsklik → Open als macOS waarschuwt).
cd "${0:A:h}"
clear
print -P "%B%F{208}R7N%f Editing Studio — installatie%b\n"
ok()   { print -P "  %F{green}✓%f $1"; }
stap() { print -P "  %F{208}→%f $1"; }
mis()  { print -P "  %F{red}✗%f $1"; }
export PATH="$HOME/.local/bin:/opt/homebrew/bin:$PATH"

[[ "$(uname -m)" == "arm64" ]] || { mis "Deze studio werkt alleen op een Mac met Apple Silicon (M1 of nieuwer)."; read -k1 "?Druk op een toets om te sluiten."; exit 1; }
ok "Mac met Apple Silicon"

if ! xcode-select -p >/dev/null 2>&1; then
  stap "Xcode-commandoregeltools installeren: klik op Installeer in het venster dat verschijnt en wacht tot het klaar is."
  xcode-select --install
  read -k1 "?Druk op een toets zodra dat klaar is."
fi
ok "Xcode-commandoregeltools"

if ! command -v brew >/dev/null 2>&1; then
  stap "Homebrew installeren (vraagt om je Mac-wachtwoord)…"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi
ok "Homebrew"

for p in ffmpeg node uv; do
  command -v $p >/dev/null 2>&1 || { stap "$p installeren…"; brew install $p; }
  ok "$p"
done

if ! command -v claude >/dev/null 2>&1; then
  stap "Claude Code installeren…"
  curl -fsSL https://claude.ai/install.sh | bash
fi
ok "Claude Code ($(claude --version 2>/dev/null | head -1))"

stap "Video-engine (Remotion) installeren, dit duurt een paar minuten…"
(cd engine && npm install --no-audit --no-fund --loglevel=error) && ok "Video-engine"

stap "Spraakherkenning klaarzetten (eenmalige download van ±1,6 GB)…"
STIL="$(mktemp -d)/stil.wav"
ffmpeg -v error -y -f lavfi -i anullsrc=r=16000:cl=mono -t 1 "$STIL"
uv run -q --with mlx-whisper python tools/transcribe.py "$STIL" --taal nl >/dev/null 2>&1 && ok "Spraakherkenning"

print -P "\n%B%F{green}Klaar.%f%b"
print "Nog één ding: log eenmalig in bij Claude. Open Terminal, typ  claude  en daarna  /login ."
print "Start de studio daarna met een dubbelklik op 'Start R7N Editing Studio.command'."
print "Altijd aan, ook na een herstart: voer één keer  zsh scripts/installeer-service.sh  uit.\n"
read -k1 "?Druk op een toets om te sluiten."
