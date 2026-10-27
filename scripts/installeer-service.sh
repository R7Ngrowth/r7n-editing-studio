#!/bin/zsh
# Zet R7N Editing Studio als achtergrondservice (launchd), zodat hij altijd draait op http://localhost:4242,
# ook na een herstart van je Mac. Eén keer uitvoeren: zsh scripts/installeer-service.sh
# Verwijderen: launchctl bootout gui/$(id -u)/nl.r7ngrowth.editing-studio && rm ~/Library/LaunchAgents/nl.r7ngrowth.editing-studio.plist
set -e
cd "${0:A:h}/.."
STUDIO="$PWD"
LABEL="nl.r7ngrowth.editing-studio"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
NODE="$(command -v node || echo "$HOME/.local/bin/node")"
mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>$NODE</string><string>$STUDIO/server.mjs</string></array>
  <key>WorkingDirectory</key><string>$STUDIO</string>
  <key>EnvironmentVariables</key><dict>
    <key>PATH</key><string>$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    <key>HOME</key><string>$HOME</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$STUDIO/service.log</string>
  <key>StandardErrorPath</key><string>$STUDIO/service.log</string>
</dict></plist>
PLIST
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
sleep 2
if curl -fs http://localhost:4242/api/status >/dev/null; then
  echo "R7N Editing Studio draait als service op http://localhost:4242 (herstart: launchctl kickstart -k gui/$(id -u)/$LABEL)"
else
  echo "Service geplaatst, maar de studio antwoordt nog niet. Kijk in $STUDIO/service.log"; exit 1
fi
