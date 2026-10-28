#!/usr/bin/env node
// Controlebeelden op gekozen seconden:  node tools/stills.mjs 0.5 3.2 7
// Schrijft out/stills/<seconde>.png (1080×1920). Met --sheet maakt hij ook out/sheet.jpg (contactblad, 4 per rij).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

const meta = JSON.parse(readFileSync("src/data/meta.json", "utf8"));
const fps = meta.fps || 30;
const args = process.argv.slice(2);
const sheet = args.includes("--sheet");
const tijden = args.filter((a) => a !== "--sheet").map(Number).filter((n) => !Number.isNaN(n));
if (!tijden.length) {
  console.error("geef seconden op, bijv.: node tools/stills.mjs 0.5 3.2 7");
  process.exit(1);
}
mkdirSync("out/stills", { recursive: true });
const remotion = existsSync("node_modules/.bin/remotion") ? "node_modules/.bin/remotion" : "remotion";
const paden = [];
for (const t of tijden) {
  const frame = Math.min(meta.durationInFrames - 1, Math.max(0, Math.round(t * fps)));
  const uit = `out/stills/${t.toFixed(1)}.png`;
  execFileSync(remotion, ["still", "src/index.ts", "Reel", uit, `--frame=${frame}`, "--log=error"], { stdio: "inherit" });
  paden.push(uit);
  console.log(`${t.toFixed(1)} s → ${uit}`);
}
if (sheet) {
  execFileSync("uv", ["run", "-q", "--with", "pillow", "python", "tools/sheet.py", "out/sheet.jpg", ...paden], { stdio: "inherit" });
}
