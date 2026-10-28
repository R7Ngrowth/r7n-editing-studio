// Stijlen: elke stijl is een map met stijl.json, SKILL.md, template/ (Remotion) en voorbeeld/.
// Een eigen stijl bouwt Claude uit referentievideo's, volgens werkwijze/STIJL-BOUWEN.md.
import fsp from "node:fs/promises";
import path from "node:path";
import { CONFIG, MAPPEN, ROOT } from "./config.mjs";
import { bestaat, kortId, leesJson, naarPrullenbak, nu, schrijfJson, slug, wijzig } from "./opslag.mjs";
import * as claude from "./claude.mjs";
import { plan } from "./wachtrij.mjs";

export const map = (id) => path.join(MAPPEN.stijlen, id);
export const bestand = (id) => path.join(map(id), "stijl.json");
export const lees = (id) => leesJson(bestand(id));

export async function lijst() {
  const ids = (await fsp.readdir(MAPPEN.stijlen).catch(() => [])).filter((d) => !d.startsWith(".") && bestaat(bestand(d)));
  const alle = (await Promise.all(ids.map(lees))).filter(Boolean);
  // Lokale referentiebeelden (niet in git): laten Claude en de maker zien welk niveau de montage moet halen.
  for (const s of alle) s.referentiebeelden = (await fsp.readdir(path.join(map(s.id), "referentiebeelden")).catch(() => [])).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort((a, b) => parseFloat(a.replace(/[^\d.]/g, "")) - parseFloat(b.replace(/[^\d.]/g, "")));
  const ingebouwd = alle.filter((s) => s.type === "ingebouwd").sort((a, b) => (a.volgorde ?? 0) - (b.volgorde ?? 0));
  const eigen = alle.filter((s) => s.type !== "ingebouwd").sort((a, b) => (a.gemaakt < b.gemaakt ? 1 : -1));
  return [...eigen, ...ingebouwd];
}
export const klaar = async () => (await lijst()).filter((s) => s.status === "klaar");

export async function maak({ naam, type, bron, link, wensen }) {
  if (!naam?.trim()) throw new Error("Geef de stijl een naam");
  let id = slug(naam, "stijl");
  while (bestaat(map(id))) id = `${slug(naam, "stijl")}-${kortId()}`;
  await fsp.mkdir(path.join(map(id), "referentie"), { recursive: true });
  const stijl = {
    id,
    naam: String(naam).trim().slice(0, 60),
    type: type === "concurrent" ? "concurrent" : "eigen",
    bron: String(bron ?? "").slice(0, 120),
    link: String(link ?? "").slice(0, 300),
    wensen: String(wensen ?? "").slice(0, 2000),
    beschrijving: "",
    kenmerken: [],
    voorbeelden: [],
    status: "concept",
    stap: "Referenties uploaden",
    gemaakt: nu(),
  };
  await schrijfJson(bestand(id), stijl);
  return stijl;
}

export async function referentieMap(id) {
  const m = path.join(map(id), "referentie");
  await fsp.mkdir(m, { recursive: true });
  const n = (await fsp.readdir(m)).length + 1;
  return { map: m, naam: `referentie-${n}` };
}

const opdrachtVoor = (stijl, referenties) => `Bouw een nieuwe editingstijl voor R7N Editing Studio. Lees eerst ${path.join(MAPPEN.werkwijze, "STIJL-BOUWEN.md")} en volg die volledig; lees daarna ${path.join(MAPPEN.werkwijze, "MONTAGE.md")} zodat je weet hoe een stijl later gebruikt wordt.

Gegevens:
- Studio: ${ROOT}
- Engine (gedeelde Remotion-installatie): ${MAPPEN.engine}
- Stijlmap (werk alleen hierin): ${map(stijl.id)}
- Stijl-id: ${stijl.id}
- Naam: ${stijl.naam}
- Soort referentie: ${stijl.type === "concurrent" ? "concurrent: leg alleen de editingstijl vast, nooit beeld, audio, teksten of de naam van die persoon" : "eigen edits van de maker"}
${stijl.bron ? `- Account van de referentie (alleen ter context, niet in de stijl noemen): ${stijl.bron}\n` : ""}${stijl.link ? `- Link (ter context): ${stijl.link}\n` : ""}${stijl.wensen ? `- Aanwijzingen van de maker (leidend, kijk hier extra goed naar): ${stijl.wensen}\n` : ""}- Referentievideo's: ${referenties.join(", ") || "(geen)"}
- Taal van de video's: ${CONFIG.taal}`;

async function bouw(id) {
  const stijl = await lees(id);
  if (!stijl || stijl.status === "gestopt") return;
  const m = map(id);
  await fsp.rm(path.join(m, "voortgang.json"), { force: true });
  await wijzig(bestand(id), (s) => Object.assign(s, { status: "bouwen", stap: "Claude start", procent: 2, gestart: nu(), fout: null, laatste: [] }));
  const refs = (await fsp.readdir(path.join(m, "referentie")).catch(() => [])).map((f) => path.join(m, "referentie", f));
  const uit = await claude.sessie({
    sleutel: `stijl/${id}`,
    werkmap: m,
    opdracht: opdrachtVoor(stijl, refs),
    extraMappen: [ROOT],
    onVoortgang: ({ laatste, voortgang }) =>
      wijzig(bestand(id), (s) => {
        if (s.status !== "bouwen") return false;
        s.laatste = laatste;
        if (voortgang) Object.assign(s, { stap: voortgang.stap ?? s.stap, procent: voortgang.procent ?? s.procent });
      }),
  });
  const compleet = bestaat(path.join(m, "SKILL.md")) && bestaat(path.join(m, "template", "src"));
  await wijzig(bestand(id), (s) => {
    if (s.status === "gestopt") return false;
    Object.assign(s, {
      status: compleet ? "klaar" : "mislukt",
      stap: compleet ? "Klaar" : "Stijl niet compleet (SKILL.md of template ontbreekt)",
      procent: compleet ? 100 : s.procent,
      kosten: uit.kosten,
      duurMs: uit.duurMs,
      fout: compleet ? null : String(uit.tekst).slice(0, 1500),
      klaar: nu(),
    });
  });
}

export async function startBouw(id) {
  if (!(await claude.ingelogd())) {
    await wijzig(bestand(id), (s) => Object.assign(s, { status: "mislukt", stap: "Claude Code niet ingelogd", fout: claude.inlogHulp() }));
    return;
  }
  await wijzig(bestand(id), (s) => Object.assign(s, { status: "wachtrij", stap: "In de wachtrij", fout: null }));
  plan(() => bouw(id));
}

export async function stop(id) {
  await wijzig(bestand(id), (s) => Object.assign(s, { status: "gestopt", stap: "Gestopt" }));
  claude.stop(`stijl/${id}`);
}

export async function verwijder(id) {
  const s = await lees(id);
  if (!s) return false;
  if (s.type === "ingebouwd") throw new Error("Ingebouwde stijlen kun je niet verwijderen");
  claude.stop(`stijl/${id}`);
  await naarPrullenbak(map(id));
  return true;
}

// Na een herstart van de studio is elke lopende bouw afgebroken; zeg dat eerlijk.
export async function herstelNaHerstart() {
  for (const s of await lijst())
    if (["bouwen", "wachtrij"].includes(s.status)) await wijzig(bestand(s.id), (x) => Object.assign(x, { status: "mislukt", stap: "Onderbroken (studio herstart)" }));
}
