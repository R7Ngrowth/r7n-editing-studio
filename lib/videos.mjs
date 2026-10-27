// Video's: elke upload is een map met video.json, de bron, gedeeld/ (transcript, miniatuur) en per stijl een montagemap.
import fsp from "node:fs/promises";
import path from "node:path";
import { CONFIG, MAPPEN } from "./config.mjs";
import { bestaat, kortId, leesJson, naarPrullenbak, nu, schrijfJson, wijzig } from "./opslag.mjs";
import * as claude from "./claude.mjs";
import * as media from "./media.mjs";
import * as stijlen from "./stijlen.mjs";
import { plan } from "./wachtrij.mjs";

export const map = (id) => path.join(MAPPEN.videos, id);
export const bestand = (id) => path.join(map(id), "video.json");
export const lees = (id) => leesJson(bestand(id));

export async function lijst() {
  const ids = (await fsp.readdir(MAPPEN.videos).catch(() => [])).filter((d) => !d.startsWith(".") && bestaat(bestand(d)));
  return (await Promise.all(ids.map(lees))).filter(Boolean).sort((a, b) => (a.gemaakt < b.gemaakt ? 1 : -1));
}

export function nieuwId() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}-${kortId()}`;
}

export async function maak({ id, titel, bestandsnaam, bron, notities, vaktermen }) {
  const video = {
    id,
    titel: (titel || bestandsnaam.replace(/\.[^.]+$/, "")).slice(0, 120),
    bestand: bestandsnaam,
    bron,
    notities: String(notities ?? "").slice(0, 4000),
    vaktermen: String(vaktermen ?? "").slice(0, 500),
    gemaakt: nu(),
    voorbereiding: { status: "wachtrij", stap: "Upload ontvangen" },
    montages: {},
  };
  await schrijfJson(bestand(id), video);
  return video;
}

// Eén keer per video: duur, miniatuur, geluidsspoor en een transcript met woordtijden. Elke stijl gebruikt dat daarna.
async function bereidVoor(id) {
  const video = await lees(id);
  const m = map(id);
  const gedeeld = path.join(m, "gedeeld");
  await fsp.mkdir(gedeeld, { recursive: true });
  const zet = (v) => wijzig(bestand(id), (x) => Object.assign(x, v));
  try {
    await zet({ voorbereiding: { status: "bezig", stap: "Video lezen" } });
    const bron = path.join(m, video.bron);
    const duur = await media.duur(bron);
    await media.miniatuur(bron, path.join(gedeeld, "miniatuur.jpg"), Math.min(1, duur / 3));
    await zet({ duur, voorbereiding: { status: "bezig", stap: "Spraak herkennen" } });
    const wav = path.join(gedeeld, "opname.wav");
    await media.geluid(bron, wav);
    const t = await media.transcribeer(wav, video.vaktermen);
    await fsp.writeFile(path.join(gedeeld, "transcript.txt"), t.segmenten.map((s) => `[${s.start.toFixed(1)}–${s.eind.toFixed(1)}] ${s.tekst}`).join("\n") + "\n");
    await zet({ voorbereiding: { status: "klaar", stap: "Klaar" }, fragment: t.segmenten.slice(0, 3).map((s) => s.tekst).join(" ").slice(0, 200) });
  } catch (e) {
    await zet({ voorbereiding: { status: "mislukt", stap: "Voorbereiden mislukt", fout: String(e.message).slice(0, 2000) } });
    throw e;
  }
}

const opdrachtVoor = (video, stijl, werkmap) => `Monteer deze opname zelfstandig in de stijl "${stijl.naam}" voor R7N Editing Studio. Lees eerst ${path.join(MAPPEN.werkwijze, "MONTAGE.md")} (de werkwijze) en daarna ${path.join(stijlen.map(stijl.id), "SKILL.md")} (de stijl, met een werkend sjabloon in ${path.join(stijlen.map(stijl.id), "template")}). Volg beide volledig.

Gegevens:
- Engine (gedeelde Remotion-installatie): ${MAPPEN.engine}
- Bronvideo: ${path.join(map(video.id), video.bron)}
- Transcript van de ruwe opname: ${path.join(map(video.id), "gedeeld", "opname.json")} (leesbaar: ${path.join(map(video.id), "gedeeld", "transcript.txt")})
- Werkmap (werk alleen hierin): ${werkmap}
- Taal: ${CONFIG.taal}
- Titel: ${video.titel}
${video.notities ? `- Notities van de maker: ${video.notities}\n` : ""}${video.vaktermen ? `- Vaktermen: ${video.vaktermen}\n` : ""}
Lever in de werkmap op: final.mp4, rapport.md en onderweg voortgang.json (zie MONTAGE.md). Kopieer niets naar andere mappen.`;

async function monteer(id, stijlId) {
  const video = await lees(id);
  const stijl = await stijlen.lees(stijlId);
  if (!video || !stijl || video.montages[stijlId]?.status === "gestopt") return;
  const werkmap = path.join(map(id), stijlId);
  await fsp.mkdir(werkmap, { recursive: true });
  for (const f of ["final.mp4", "rapport.md", "voortgang.json"]) await fsp.rm(path.join(werkmap, f), { force: true });
  const zet = (fn) => wijzig(bestand(id), (v) => fn(v.montages[stijlId] ?? (v.montages[stijlId] = {})));
  await zet((m) => Object.assign(m, { status: "bezig", gestart: nu(), stap: "Claude start", procent: 2, laatste: [], fout: null }));
  const uit = await claude.sessie({
    sleutel: `video/${id}/${stijlId}`,
    werkmap,
    opdracht: opdrachtVoor(video, stijl, werkmap),
    extraMappen: [map(id), stijlen.map(stijlId), MAPPEN.werkwijze, MAPPEN.tools, MAPPEN.engine],
    onVoortgang: ({ laatste, voortgang }) =>
      zet((m) => {
        if (m.status !== "bezig") return false;
        m.laatste = laatste;
        if (voortgang) Object.assign(m, { stap: voortgang.stap ?? m.stap, procent: voortgang.procent ?? m.procent });
      }),
  });
  const gelukt = bestaat(path.join(werkmap, "final.mp4"));
  await zet((m) => {
    if (m.status === "gestopt") return false;
    Object.assign(m, {
      status: gelukt ? "klaar" : "mislukt",
      stap: gelukt ? "Klaar" : "Geen eindvideo gemaakt",
      procent: gelukt ? 100 : m.procent,
      klaar: nu(),
      kosten: uit.kosten,
      duurMs: uit.duurMs,
      rapport: bestaat(path.join(werkmap, "rapport.md")),
      fout: gelukt ? null : String(uit.tekst).slice(0, 1500),
    });
  });
}

export async function start(id, stijlIds) {
  const zetAlle = (v) => wijzig(bestand(id), (x) => stijlIds.forEach((s) => (x.montages[s] = { ...v })));
  await zetAlle({ status: "wachtrij", stap: "Wacht op voorbereiding" });
  const video = await lees(id);
  if (video.voorbereiding?.status !== "klaar") {
    try {
      await bereidVoor(id);
    } catch {
      return zetAlle({ status: "mislukt", stap: "Voorbereiden mislukt" });
    }
  }
  if (!(await claude.ingelogd())) return zetAlle({ status: "mislukt", stap: "Claude Code niet ingelogd", fout: claude.inlogHulp() });
  await zetAlle({ status: "wachtrij", stap: "In de wachtrij" });
  for (const s of stijlIds) plan(() => monteer(id, s));
}

export async function opnieuw(id, stijlId) {
  const video = await lees(id);
  if (!video) return;
  if (video.voorbereiding?.status !== "klaar") return start(id, [stijlId]);
  if (!(await claude.ingelogd())) {
    await wijzig(bestand(id), (v) => (v.montages[stijlId] = { status: "mislukt", stap: "Claude Code niet ingelogd", fout: claude.inlogHulp() }));
    return;
  }
  await wijzig(bestand(id), (v) => (v.montages[stijlId] = { status: "wachtrij", stap: "In de wachtrij" }));
  plan(() => monteer(id, stijlId));
}

export async function stop(id, stijlId) {
  await wijzig(bestand(id), (v) => (v.montages[stijlId] ? Object.assign(v.montages[stijlId], { status: "gestopt", stap: "Gestopt" }) : false));
  claude.stop(`video/${id}/${stijlId}`);
}

export async function verwijder(id) {
  if (!bestaat(bestand(id))) return false;
  claude.stopAlle(`video/${id}/`);
  await naarPrullenbak(map(id));
  return true;
}

export async function herstelNaHerstart() {
  for (const v of await lijst()) {
    const open = Object.values(v.montages).filter((m) => ["bezig", "wachtrij"].includes(m.status));
    if (!open.length) continue;
    await wijzig(bestand(v.id), (x) => Object.values(x.montages).forEach((m) => ["bezig", "wachtrij"].includes(m.status) && Object.assign(m, { status: "mislukt", stap: "Onderbroken (studio herstart)" })));
  }
}
