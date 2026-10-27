// Kleine opslaglaag: JSON-bestanden per stijl en per video, met wijzigingen netjes na elkaar.
import fs from "node:fs";
import fsp from "node:fs/promises";
import crypto from "node:crypto";

export const nu = () => new Date().toISOString();
export const bestaat = (p) => fs.existsSync(p);

export async function leesJson(p, anders = null) {
  try {
    return JSON.parse(await fsp.readFile(p, "utf8"));
  } catch {
    return anders;
  }
}
export const schrijfJson = (p, data) => fsp.writeFile(p, JSON.stringify(data, null, 2) + "\n");

// Twee stappen die tegelijk hetzelfde bestand willen bijwerken, wachten op elkaar. Zo raakt niets kwijt.
const rijen = new Map();
export function wijzig(p, fn) {
  const vorige = rijen.get(p) ?? Promise.resolve();
  const volgende = vorige.then(async () => {
    const data = await leesJson(p);
    if (!data) return null;
    const uit = await fn(data);
    if (uit === false) return data;
    data.bijgewerkt = nu();
    await schrijfJson(p, data);
    return data;
  });
  rijen.set(p, volgende.catch(() => {}));
  return volgende;
}

export function slug(tekst, anders = "item") {
  const s = String(tekst)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 40)
    .replace(/^-|-$/g, "");
  return s || anders;
}
export const kortId = () => crypto.randomBytes(3).toString("hex");

// Verwijderen = verplaatsen naar een prullenbakmap naast het origineel; niets gaat definitief weg.
export async function naarPrullenbak(map) {
  const doel = `${map.replace(/\/$/, "")}`.replace(/([^/]+)$/, (naam) => `.prullenbak-${naam}-${Date.now()}`);
  await fsp.rename(map, doel);
  return doel;
}
