// Claude Code aansturen: inlogcontrole en één sessie per opdracht, met voortgang terug naar de studio.
//
// Toestemming (studio.config.json → "claudeToestemming"):
//   "beperkt"  (standaard) Claude mag alleen de commando's die een montage nodig heeft (ffmpeg, uv, node, python, …)
//              en alleen bestanden lezen en schrijven in de werkmap en de mappen van de studio.
//   "volledig" Claude mag alles zonder te vragen. Alleen als montages vastlopen op een geblokkeerd commando.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { CONFIG, schoneOmgeving } from "./config.mjs";
import { leesJson, nu } from "./opslag.mjs";

export let status = { ok: null, melding: "Nog niet gecontroleerd", gecontroleerd: null };
const processen = new Map();

// Commando's die een montage of stijlbouw nodig heeft; meer niet.
const TOEGESTAAN = [
  "Read", "Write", "Edit", "Glob", "Grep", "WebFetch",
  "Bash(ffmpeg:*)", "Bash(ffprobe:*)", "Bash(uv:*)", "Bash(node:*)", "Bash(npx:*)", "Bash(python3:*)", "Bash(zsh:*)", "Bash(sh:*)",
  "Bash(ln:*)", "Bash(cp:*)", "Bash(mv:*)", "Bash(mkdir:*)", "Bash(ls:*)", "Bash(cat:*)", "Bash(head:*)", "Bash(tail:*)", "Bash(wc:*)",
  "Bash(rm:*)", "Bash(swiftc:*)", "Bash(curl:*)", "Bash(cd:*)", "Bash(echo:*)", "Bash(open:*)", "Bash(/Applications/Google Chrome.app/*)",
];

export function controleer() {
  return new Promise((klaar) => {
    let uit = "";
    const p = spawn("claude", ["-p", "Antwoord met precies één woord: ok", "--output-format", "json"], {
      env: schoneOmgeving(),
      cwd: os.tmpdir(),
      stdio: ["ignore", "pipe", "pipe"],
    });
    p.stdout.on("data", (d) => (uit += d));
    p.on("error", (e) => klaar((status = { ok: false, melding: `Claude Code niet gevonden (${e.message})`, gecontroleerd: nu() })));
    p.on("close", () => {
      let d = {};
      try {
        d = JSON.parse(uit);
      } catch {}
      status =
        d.is_error || !d.result
          ? { ok: false, melding: d.result || "Claude Code gaf geen antwoord; waarschijnlijk niet ingelogd", gecontroleerd: nu() }
          : { ok: true, melding: "Claude Code is ingelogd", gecontroleerd: nu() };
      klaar(status);
    });
  });
}
export async function ingelogd() {
  if (status.ok !== true) await controleer();
  return status.ok === true;
}
export const inlogHulp = () => `${status.melding}. Log in via Terminal (typ claude en daarna /login) en probeer het opnieuw.`;

// Eén leesbare regel per gebeurtenis, voor de kaart in de studio.
function regels(ev) {
  if (ev.type !== "assistant") return [];
  const uit = [];
  for (const blok of ev.message?.content ?? []) {
    if (blok.type === "text" && blok.text?.trim()) uit.push("› " + blok.text.trim().replace(/\s+/g, " "));
    if (blok.type === "tool_use") {
      const i = blok.input ?? {};
      uit.push("⚙ " + String(i.description || i.command || i.file_path || i.pattern || blok.name).replace(os.homedir(), "~"));
    }
  }
  return uit;
}

function toestemmingArgs() {
  if (CONFIG.claudeToestemming === "volledig") return ["--permission-mode", "bypassPermissions"];
  return ["--permission-mode", "acceptEdits", "--allowedTools", TOEGESTAAN.join(",")];
}

/**
 * Draait één Claude Code-sessie in `werkmap`. `onVoortgang({laatste, voortgang})` krijgt om de paar seconden
 * de laatste regels en de inhoud van voortgang.json (die Claude zelf bijwerkt).
 */
export async function sessie({ sleutel, werkmap, opdracht, extraMappen = [], onVoortgang }) {
  const log = fs.createWriteStream(path.join(werkmap, "claude-log.jsonl"), { flags: "a" });
  const args = ["-p", opdracht, "--output-format", "stream-json", "--verbose", ...toestemmingArgs()];
  for (const m of extraMappen) args.push("--add-dir", m);
  if (CONFIG.model) args.push("--model", CONFIG.model);
  const p = spawn("claude", args, { cwd: werkmap, env: schoneOmgeving(), stdio: ["ignore", "pipe", "pipe"] });
  processen.set(sleutel, p);

  const laatste = [];
  let resultaat = null;
  let laatstGemeld = 0;
  const noteer = (s) => {
    laatste.push({ t: nu(), s: s.slice(0, 280) });
    if (laatste.length > 40) laatste.shift();
  };
  const meld = async (forceer) => {
    if (!forceer && Date.now() - laatstGemeld < 1500) return;
    laatstGemeld = Date.now();
    await onVoortgang?.({ laatste: laatste.slice(-8), voortgang: await leesJson(path.join(werkmap, "voortgang.json")) });
  };

  const rl = createInterface({ input: p.stdout });
  rl.on("line", (lijn) => {
    if (!lijn.trim()) return;
    log.write(lijn + "\n");
    let ev;
    try {
      ev = JSON.parse(lijn);
    } catch {
      return;
    }
    regels(ev).forEach(noteer);
    if (ev.type === "result") resultaat = ev;
    void meld(false);
  });
  p.stderr.on("data", (d) => noteer("! " + String(d).trim()));
  p.on("error", (e) => noteer("! " + e.message));
  await new Promise((klaar) => p.on("close", klaar));
  processen.delete(sleutel);
  log.end();
  await meld(true);
  return {
    geslaagd: !!resultaat && !resultaat.is_error,
    tekst: resultaat?.result ?? laatste.slice(-3).map((l) => l.s).join(" "),
    kosten: resultaat?.total_cost_usd ?? null,
    duurMs: resultaat?.duration_ms ?? null,
    laatste,
  };
}

export function stop(sleutel) {
  const p = processen.get(sleutel);
  if (p) p.kill("SIGTERM");
  return !!p;
}
export const stopAlle = (voorvoegsel) => [...processen.keys()].filter((k) => k.startsWith(voorvoegsel)).forEach(stop);
