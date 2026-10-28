// Hulpjes voor de webserver: antwoorden, CORS, bestanden met range-ondersteuning, uploads en veilige paden.
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { CONFIG } from "./config.mjs";

export const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

export function antwoord(res, code, inhoud, type = "application/json") {
  res.writeHead(code, { "content-type": type, "cache-control": "no-store" });
  res.end(typeof inhoud === "string" || Buffer.isBuffer(inhoud) ? inhoud : JSON.stringify(inhoud));
}
export const fout = (res, code, melding) => antwoord(res, code, { fout: melding });

// Mission Control (en een lokale dev-server) mag de studio vanuit de browser aanspreken.
export function cors(req, res) {
  const o = req.headers.origin;
  if (!o) return;
  const mag = (CONFIG.toegestaneOrigins ?? []).includes(o) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
  if (!mag) return;
  res.setHeader("access-control-allow-origin", o);
  res.setHeader("access-control-allow-methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type,x-bestand,x-titel,x-notities,x-vaktermen,x-stijlen,x-rol,x-nr,range");
  res.setHeader("access-control-max-age", "600");
}

export function veiligPad(basis, relatief) {
  const p = path.normalize(path.join(basis, relatief));
  return p === basis || p.startsWith(basis + path.sep) ? p : null;
}

export async function bestand(req, res, p) {
  let st;
  try {
    st = await fsp.stat(p);
    if (!st.isFile()) throw new Error();
  } catch {
    return fout(res, 404, "niet gevonden");
  }
  const type = MIME[path.extname(p).toLowerCase()] ?? "application/octet-stream";
  // Altijd opnieuw controleren: wordt een bestand vervangen (bijv. een nieuwe export), dan mag de browser geen oude stukken mengen.
  const vers = { "cache-control": "no-cache", etag: `"${st.size}-${Math.round(st.mtimeMs)}"`, "last-modified": st.mtime.toUTCString() };
  const range = req.headers.range;
  if (range) {
    const [a, b] = range.replace("bytes=", "").split("-");
    const start = Number(a) || 0;
    const eind = b ? Math.min(Number(b), st.size - 1) : st.size - 1;
    res.writeHead(206, { ...vers, "content-type": type, "accept-ranges": "bytes", "content-range": `bytes ${start}-${eind}/${st.size}`, "content-length": eind - start + 1 });
    return fs.createReadStream(p, { start, end: eind }).pipe(res);
  }
  res.writeHead(200, { ...vers, "content-type": type, "accept-ranges": "bytes", "content-length": st.size });
  fs.createReadStream(p).pipe(res);
}

export const kop = (req, naam) => {
  try {
    return decodeURIComponent(req.headers[naam] || "");
  } catch {
    return "";
  }
};
export const bestandsnaam = (naam, anders) => (naam || anders).replace(/[^\w.\- ]/g, "_").slice(0, 120) || anders;

export const body = (req) =>
  new Promise((ok) => {
    let b = "";
    req.on("data", (d) => (b += d));
    req.on("end", () => {
      try {
        ok(JSON.parse(b || "{}"));
      } catch {
        ok({});
      }
    });
  });

export const ontvang = (req, doel) =>
  new Promise((ok, nee) => {
    const uit = fs.createWriteStream(doel);
    req.pipe(uit);
    uit.on("finish", ok);
    uit.on("error", nee);
  });
