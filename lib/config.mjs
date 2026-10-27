// Instellingen en vaste paden van de studio. Alles staat in de map van de studio zelf.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const MAPPEN = {
  stijlen: path.join(ROOT, "stijlen"),
  videos: path.join(ROOT, "videos"),
  engine: path.join(ROOT, "engine"),
  werkwijze: path.join(ROOT, "werkwijze"),
  tools: path.join(ROOT, "tools"),
  public: path.join(ROOT, "public"),
};

const STANDAARD = {
  port: 4242,
  maxParallel: 2,
  model: null,
  taal: "nl",
  toegestaneOrigins: ["https://app.r7ngrowth.nl"],
};

function lees() {
  try {
    return { ...STANDAARD, ...JSON.parse(fs.readFileSync(path.join(ROOT, "studio.config.json"), "utf8")) };
  } catch {
    return { ...STANDAARD };
  }
}
export const CONFIG = lees();
export const PORT = Number(process.env.PORT ?? CONFIG.port);

// Claude Code mag de omgeving van een bovenliggende Claude-sessie niet erven, anders denkt hij dat hij genest draait.
export function schoneOmgeving() {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!/^(CLAUDE|ANTHROPIC_)/.test(k)) env[k] = v;
  env.PATH = [path.join(os.homedir(), ".local/bin"), "/opt/homebrew/bin", "/usr/local/bin", env.PATH ?? "/usr/bin:/bin"].join(":");
  env.HOME = os.homedir();
  return env;
}

for (const m of [MAPPEN.stijlen, MAPPEN.videos]) fs.mkdirSync(m, { recursive: true });
