// ffmpeg en spraakherkenning: duur, miniatuur, geluidsspoor en transcript met woordtijden.
import path from "node:path";
import { execFile } from "node:child_process";
import { CONFIG, MAPPEN, schoneOmgeving } from "./config.mjs";
import { leesJson } from "./opslag.mjs";

const voer = (cmd, args, opties = {}) =>
  new Promise((ok, nee) => {
    execFile(cmd, args, { maxBuffer: 64 * 1024 * 1024, env: schoneOmgeving(), ...opties }, (e, uit, fout) => (e ? nee(new Error((fout || e.message).trim().slice(-2000))) : ok(uit)));
  });

export async function duur(bestand) {
  const uit = JSON.parse(await voer("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "json", bestand]));
  return Number(uit.format?.duration ?? 0);
}

export async function miniatuur(bestand, doel, seconde = 1) {
  await voer("ffmpeg", ["-y", "-v", "error", "-ss", String(seconde), "-i", bestand, "-frames:v", "1", "-vf", "scale=360:-2", doel]);
}

export async function geluid(bestand, doelWav) {
  await voer("ffmpeg", ["-y", "-v", "error", "-i", bestand, "-vn", "-ac", "1", "-ar", "16000", doelWav]);
}

/** Transcribeert een wav met woordtijden; schrijft <wav zonder .wav>.json en geeft het transcript terug. */
export async function transcribeer(wav, vaktermen = "") {
  await voer("uv", ["run", "-q", "--with", "mlx-whisper", "python", path.join(MAPPEN.tools, "transcribe.py"), wav, "--taal", CONFIG.taal, "--termen", vaktermen], {
    cwd: path.dirname(wav),
  });
  return leesJson(wav.replace(/\.wav$/, ".json"), { segmenten: [], woorden: [] });
}
