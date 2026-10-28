// R7N Editing Studio — lokale webserver (geen pakketten nodig). Start: node server.mjs
// Twee dingen: eigen editingstijlen bouwen uit voorbeeldvideo's, en opnames laten monteren door Claude Code.
import http from "node:http";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { MAPPEN, PORT, ROOT } from "./lib/config.mjs";
import { antwoord, bestand, bestandsnaam, body, cors, fout, kop, MIME, ontvang, veiligPad } from "./lib/http.mjs";
import * as claude from "./lib/claude.mjs";
import * as media from "./lib/media.mjs";
import * as stijlen from "./lib/stijlen.mjs";
import * as videos from "./lib/videos.mjs";
import { stand } from "./lib/wachtrij.mjs";

const VIDEO_EXT = /\.(mp4|mov|m4v)$/i;

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
  const delen = url.pathname.split("/").filter(Boolean);
  const M = req.method;
  const [a, b, c, d, e] = delen;

  // --- status ---
  if (M === "GET" && url.pathname === "/api/status") return antwoord(res, 200, { claude: claude.status, ...stand(), versie: "2.0.0" });
  if (M === "POST" && url.pathname === "/api/status/controleer") return antwoord(res, 200, { claude: await claude.controleer() });
  if (M === "GET" && url.pathname === "/api/handleiding") return antwoord(res, 200, await fsp.readFile(path.join(ROOT, "HANDLEIDING.md"), "utf8"), MIME[".md"]);

  // --- notitie inspreken: audio uit de browser → tekst, met de spraakherkenning op deze Mac ---
  if (M === "POST" && url.pathname === "/api/dicteer") {
    const ext = /mp4|m4a|aac/.test(req.headers["content-type"] || "") ? ".m4a" : /ogg/.test(req.headers["content-type"] || "") ? ".ogg" : ".webm";
    const tmp = path.join(os.tmpdir(), `r7n-dicteer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`);
    await ontvang(req, tmp);
    try {
      const { wav, tekst } = await media.dicteer(tmp, kop(req, "x-vaktermen"));
      for (const f of [wav, wav.replace(/\.wav$/, ".json")]) await fsp.rm(f, { force: true });
      return antwoord(res, 200, { tekst });
    } finally {
      await fsp.rm(tmp, { force: true });
    }
  }

  // --- stijlen ---
  if (a === "api" && b === "stijlen") {
    if (!c) {
      if (M === "GET") return antwoord(res, 200, await stijlen.lijst());
      if (M === "POST") return antwoord(res, 200, await stijlen.maak(await body(req)));
    } else {
      const stijl = await stijlen.lees(c);
      if (!stijl) return fout(res, 404, "onbekende stijl");
      if (M === "PUT" && d === "referentie") {
        const naam = bestandsnaam(kop(req, "x-bestand"), "referentie.mp4");
        const { map, naam: basis } = await stijlen.referentieMap(c);
        await ontvang(req, path.join(map, basis + (path.extname(naam).toLowerCase() || ".mp4")));
        return antwoord(res, 200, { ok: true });
      }
      if (M === "POST" && d === "bouw") {
        void stijlen.startBouw(c);
        return antwoord(res, 200, { ok: true });
      }
      if (M === "POST" && d === "stop") {
        await stijlen.stop(c);
        return antwoord(res, 200, { ok: true });
      }
      if (M === "DELETE" && !d) return antwoord(res, 200, { ok: await stijlen.verwijder(c) });
    }
  }

  // --- video's ---
  if (a === "api" && b === "videos") {
    if (!c && M === "GET") return antwoord(res, 200, await videos.lijst());
    if (!c && M === "POST" && (req.headers["content-type"] || "").includes("application/json")) {
      // Meerdere clips: eerst de video aanmaken, daarna elke clip apart uploaden (PUT …/clip), dan starten (POST …/start).
      const b = await body(req);
      const id = videos.nieuwId();
      await fsp.mkdir(videos.map(id), { recursive: true });
      const video = await videos.maak({ id, titel: b.titel, bestandsnaam: String(b.titel || "Video"), bron: "opname.mp4", notities: b.notities, vaktermen: b.vaktermen, clips: true });
      return antwoord(res, 200, video);
    }
    if (!c && M === "POST") {
      // Upload: de video komt als body, de rest als headers (zo blijft het één verzoek met voortgang in de browser).
      const naam = bestandsnaam(kop(req, "x-bestand"), "opname.mov");
      if (!VIDEO_EXT.test(naam)) return fout(res, 400, "Alleen .mp4, .mov of .m4v");
      const id = videos.nieuwId();
      await fsp.mkdir(videos.map(id), { recursive: true });
      const bron = "opname" + path.extname(naam).toLowerCase();
      await ontvang(req, path.join(videos.map(id), bron));
      const geldig = new Set((await stijlen.klaar()).map((s) => s.id));
      const gekozen = kop(req, "x-stijlen").split(",").filter((s) => geldig.has(s));
      const video = await videos.maak({ id, titel: kop(req, "x-titel"), bestandsnaam: naam, bron, notities: kop(req, "x-notities"), vaktermen: kop(req, "x-vaktermen") });
      void videos.start(id, gekozen);
      return antwoord(res, 200, video);
    }
    if (c) {
      if (!(await videos.lees(c))) return fout(res, 404, "onbekende video");
      if (M === "PUT" && d === "clip") {
        const naam = bestandsnaam(kop(req, "x-bestand"), "clip.mp4");
        if (!VIDEO_EXT.test(naam)) return fout(res, 400, "Alleen .mp4, .mov of .m4v");
        const nr = Math.max(1, Math.min(200, Number(kop(req, "x-nr")) || 1));
        const doel = await videos.voegClipToe(c, { naam, rol: kop(req, "x-rol"), nr });
        await ontvang(req, doel);
        return antwoord(res, 200, { ok: true });
      }
      if (M === "POST" && d === "start") {
        const b = await body(req);
        const geldig = new Set((await stijlen.klaar()).map((s) => s.id));
        const gekozen = (Array.isArray(b.stijlen) ? b.stijlen : []).filter((s) => geldig.has(s));
        if (!gekozen.length) return fout(res, 400, "Kies minstens één stijl");
        void videos.start(c, gekozen);
        return antwoord(res, 200, { ok: true });
      }
      if (M === "POST" && d === "opnieuw" && e) {
        void videos.opnieuw(c, e);
        return antwoord(res, 200, { ok: true });
      }
      if (M === "POST" && d === "stop" && e) {
        await videos.stop(c, e);
        return antwoord(res, 200, { ok: true });
      }
      if (M === "DELETE" && !d) return antwoord(res, 200, { ok: await videos.verwijder(c) });
    }
  }

  // --- bestanden: alleen wat de interface nodig heeft ---
  if (M === "GET" && a === "media" && b === "videos" && c) {
    const p = veiligPad(videos.map(c), delen.slice(3).join("/"));
    if (!p || !/\/(gedeeld\/miniatuur\.jpg|[^/]+\/(final\.mp4|rapport\.md))$/.test(p)) return fout(res, 403, "niet beschikbaar");
    return bestand(req, res, p);
  }
  if (M === "GET" && a === "media" && b === "stijlen" && c) {
    const rel = delen.slice(3).join("/");
    if (!/^((voorbeeld|referentiebeelden)\/[^/]+|analyse\.md|SKILL\.md)$/.test(rel)) return fout(res, 403, "niet beschikbaar");
    const p = veiligPad(stijlen.map(c), rel);
    return p ? bestand(req, res, p) : fout(res, 400, "ongeldig pad");
  }
  if (M === "GET") {
    const p = veiligPad(MAPPEN.public, url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname));
    if (p) return bestand(req, res, p);
  }
  return fout(res, 404, "niet gevonden");
}

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") return antwoord(res, 204, "");
  try {
    await route(req, res);
  } catch (e) {
    fout(res, e.message?.startsWith("Geef") || e.message?.startsWith("Ingebouwde") ? 400 : 500, String(e.message));
  }
});

await stijlen.herstelNaHerstart();
await videos.herstelNaHerstart();
server.listen(PORT, "127.0.0.1", () => {
  console.log(`R7N Editing Studio draait op http://localhost:${PORT}`);
  claude.controleer().then((s) => console.log("Claude Code:", s.melding));
});
