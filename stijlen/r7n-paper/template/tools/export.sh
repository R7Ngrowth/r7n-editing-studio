#!/bin/zsh
# Rendert de reel en zet het geluid op −14 LUFS. Resultaat: ./final.mp4 (1080×1920, 30 fps, h264 + aac).
# Gebruik: zsh tools/export.sh   (vanuit de projectmap)
set -e
cd "${0:A:h}/.."
export PATH="$HOME/.local/bin:/opt/homebrew/bin:$PATH"
mkdir -p out
node_modules/.bin/remotion render src/index.ts Reel out/reel.mp4 --codec=h264 --crf=17 --log=error
# Beeld naar standaard yuv420p (tv-bereik, bt709) zodat telefoons, Safari, QuickTime en WhatsApp het tonen; geluid op 48 kHz (loudnorm geeft anders 96 kHz, dat speelt vaak stil af).
ffmpeg -y -v error -i out/reel.mp4 -vf "scale=out_range=tv,format=yuv420p" -c:v libx264 -profile:v high -level 4.1 -crf 18 -preset medium -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -ar 48000 -c:a aac -b:a 192k -movflags +faststart final.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 final.mp4 | xargs -I{} echo "final.mp4 klaar: {} s"
