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

export async function heeftGeluid(bestand) {
  const uit = await voer("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", bestand]);
  return uit.trim().length > 0;
}

/**
 * Trekt een clip gelijk zodat clips achter elkaar geplakt kunnen worden.
 * - "opname" (de maker zelf): 1080×1920 staand (liggend wordt in het midden bijgesneden), 30 fps, standaard kleur, stereo 48 kHz.
 *   Zonder geluidsspoor komt er stilte in, zodat het samenvoegen niet faalt.
 * - "beeld" (beeldmateriaal, bijv. een schermopname): eigen verhouding, maximaal 1920 px, 30 fps, zonder geluid.
 */
export async function normaliseer(bron, doel, rol) {
  if (rol === "beeld") {
    await voer("ffmpeg", ["-y", "-v", "error", "-i", bron, "-an", "-vf", "scale='min(1920,iw)':-2:flags=lanczos,fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-movflags", "+faststart", doel]);
    return;
  }
  const geluid = await heeftGeluid(bron);
  const args = ["-y", "-v", "error", "-i", bron];
  if (!geluid) args.push("-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo");
  args.push(
    "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,format=yuv420p",
    "-map", "0:v:0", "-map", geluid ? "0:a:0" : "1:a:0",
    "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
  );
  if (!geluid) args.push("-shortest");
  args.push("-movflags", "+faststart", doel);
  await voer("ffmpeg", args);
}

/** Plakt gelijkgetrokken opnames achter elkaar tot één bestand (zonder opnieuw te coderen). */
export async function plak(delen, doel, lijstPad) {
  await import("node:fs/promises").then((f) => f.writeFile(lijstPad, delen.map((d) => `file '${d.replace(/'/g, "'\\''")}'`).join("\n") + "\n"));
  await voer("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lijstPad, "-c", "copy", "-movflags", "+faststart", doel]);
}

/** Ingesproken notitie (webm/ogg/mp4 uit de browser) naar tekst, met de spraakherkenning op deze Mac. */
export async function dicteer(audioBestand, vaktermen = "") {
  const wav = audioBestand.replace(/\.[^.]+$/, "") + "-16k.wav";
  await geluid(audioBestand, wav);
  const t = await transcribeer(wav, vaktermen);
  return { wav, tekst: t.segmenten.map((s) => s.tekst).join(" ").replace(/\s+/g, " ").trim() };
}
