// Kaarten van R7N Paper: afbeelding en browser, terminal als notitieblok, rollende cijfers, lijst met iconen, citaat en titel.
import { Img, staticFile } from "remotion";
import { ease, font, kleur } from "../theme";
import type { Camera, Kaart, Markeer } from "../types";
import { Frame, Pil, nlGetal } from "../ui";

const BASIS: Camera = { x: 0.5, y: 0.5, s: 1 };

function camera(t: number, van?: Camera, naar?: Camera, wissel?: number): Camera {
  const a = van ?? BASIS;
  if (!naar || wissel === undefined || t < wissel) return a;
  const p = ease((t - wissel) / 0.7);
  return { x: a.x + (naar.x - a.x) * p, y: a.y + (naar.y - a.y) * p, s: a.s + (naar.s - a.s) * p };
}

function Markeringen({ lijst, t }: { lijst?: Markeer[]; t: number }) {
  return (
    <>
      {(lijst ?? [])
        .filter((m) => t >= m.start)
        .map((m, i) => {
          const p = ease((t - m.start) / 0.3);
          return (
            <div key={i} style={{ position: "absolute", left: `${m.x * 100}%`, top: `${m.y * 100}%`, width: `${m.w * 100}%`, height: `${m.h * 100}%`, opacity: p, transform: `scale(${1.15 - 0.15 * p})` }}>
              <div style={{ position: "absolute", inset: 0, border: `5px solid ${kleur.accent}`, borderRadius: 12, boxShadow: `0 0 0 6px ${kleur.accent}22` }} />
              {m.label && (
                <div style={{ position: "absolute", left: 0, top: "100%", marginTop: 14 }}>
                  <Pil>{m.label}</Pil>
                </div>
              )}
            </div>
          );
        })}
    </>
  );
}

function Beeld({ src, t, van, naar, wissel, markeer, balk }: { src: string; t: number; van?: Camera; naar?: Camera; wissel?: number; markeer?: Markeer[]; balk?: string }) {
  const c = camera(t, van, naar, wissel);
  return (
    <Frame>
      {balk !== undefined && (
        <div style={{ height: 64, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", background: kleur.surface2, borderBottom: `1px solid ${kleur.line}` }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((k) => (
            <span key={k} style={{ width: 16, height: 16, borderRadius: 8, background: k }} />
          ))}
          <span style={{ marginLeft: 14, flex: 1, height: 36, borderRadius: 10, background: kleur.surface, border: `1px solid ${kleur.line}`, color: kleur.muted, fontFamily: font.mono, fontSize: 20, display: "flex", alignItems: "center", padding: "0 14px" }}>{balk}</span>
        </div>
      )}
      <div style={{ position: "absolute", top: balk !== undefined ? 64 : 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${c.s})`, transformOrigin: `${c.x * 100}% ${c.y * 100}%` }}>
          <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          <Markeringen lijst={markeer} t={t} />
        </div>
      </div>
    </Frame>
  );
}

// Terminal als notitieblok op gelinieerd papier.
function Terminal({ titel, regels, t }: { titel?: string; regels: { t: string; start: number; soort?: "cmd" | "uit" | "ok" | "fout" }[]; t: number }) {
  const kleurVoor = { cmd: kleur.text, uit: kleur.muted, ok: kleur.ok, fout: kleur.bad };
  return (
    <Frame style={{ background: `repeating-linear-gradient(180deg, ${kleur.surface} 0 54px, ${kleur.line} 54px 55px)` }}>
      <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 30px", background: kleur.accent, color: "#fff", fontFamily: font.serif, fontSize: 30, letterSpacing: 1 }}>{titel ?? "notities"}</div>
      <div style={{ padding: "22px 34px", fontFamily: font.mono, fontSize: 30, lineHeight: "55px" }}>
        {regels
          .filter((r) => t >= r.start)
          .map((r, i) => {
            const soort = r.soort ?? "uit";
            const p = soort === "cmd" ? Math.min(1, (t - r.start) / 0.6) : 1;
            return (
              <div key={i} style={{ color: kleurVoor[soort], whiteSpace: "pre-wrap", opacity: Math.min(1, (t - r.start) / 0.12) }}>
                {soort === "cmd" && <span style={{ color: kleur.accent }}>› </span>}
                {soort === "ok" && <span style={{ color: kleur.ok }}>✓ </span>}
                {soort === "fout" && <span style={{ color: kleur.bad }}>✗ </span>}
                {r.t.slice(0, Math.ceil(r.t.length * p))}
              </div>
            );
          })}
      </div>
    </Frame>
  );
}

// Rollende cijfers: elke positie rolt als een tellerwiel naar zijn eindcijfer, de rechter cijfers iets later.
function Rolgetal({ tekst, p }: { tekst: string; p: number }) {
  const H = 190;
  const cijfers = tekst.split("");
  const n = cijfers.filter((c) => /\d/.test(c)).length;
  let k = 0;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", height: H, overflow: "hidden" }}>
      {cijfers.map((c, i) => {
        if (!/\d/.test(c))
          return (
            <span key={i} style={{ fontFamily: font.serif, fontSize: 200, lineHeight: `${H}px`, color: kleur.text }}>
              {c}
            </span>
          );
        const idx = k++;
        const eigenP = ease(Math.max(0, p * (1 + 0.35 * (n - 1)) - 0.35 * idx));
        const doel = Number(c);
        const stand = doel * eigenP; // 0 … doel, met een extra rondje voor de eerste cijfers
        return (
          <span key={i} style={{ display: "inline-block", height: H, overflow: "hidden", width: 118 }}>
            <span style={{ display: "block", transform: `translateY(${-stand * H}px)` }}>
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} style={{ display: "block", height: H, lineHeight: `${H}px`, textAlign: "center", fontFamily: font.serif, fontSize: 210, color: kleur.text }}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function Counter({ label, tot, start, duur = 1.6, prefix = "", suffix = "", t }: { label: string; tot: number; start: number; duur?: number; prefix?: string; suffix?: string; t: number }) {
  const p = Math.min(1, Math.max(0, (t - start) / duur));
  return (
    <Frame style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <Pil>{label}</Pil>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        {prefix && <span style={{ fontFamily: font.serif, fontSize: 120, color: kleur.accent2 }}>{prefix}</span>}
        <Rolgetal tekst={nlGetal(tot)} p={p} />
        {suffix && <span style={{ fontFamily: font.serif, fontSize: 120, color: kleur.accent2 }}>{suffix}</span>}
      </div>
    </Frame>
  );
}

function Lijst({ titel, items, t }: { titel?: string; items: { t: string; start: number; icoon?: string }[]; t: number }) {
  return (
    <Frame style={{ padding: "40px 44px", display: "flex", flexDirection: "column", gap: 18 }}>
      {titel && <div style={{ fontFamily: font.serif, fontSize: 70, letterSpacing: 1, textTransform: "uppercase", color: kleur.text, marginBottom: 8 }}>{titel}</div>}
      {items.map((it, i) => {
        const p = ease((t - it.start) / 0.35);
        if (t < it.start) return null;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, opacity: p, transform: `translateX(${(1 - p) * 40}px)`, padding: "14px 18px", borderRadius: 18, background: kleur.surface2 }}>
            <div style={{ width: 76, height: 76, borderRadius: 18, background: kleur.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontFamily: font.serif, boxShadow: "0 6px 14px rgba(255,106,26,.35)" }}>{it.icoon ?? i + 1}</div>
            <div style={{ fontFamily: font.sans, fontWeight: 600, fontSize: 44, color: kleur.text, lineHeight: 1.15 }}>{it.t}</div>
          </div>
        );
      })}
    </Frame>
  );
}

function Citaat({ tekst, door, start = 0, t }: { tekst: string; door?: string; start?: number; t: number }) {
  const p = ease((t - start) / 0.4);
  return (
    <Frame style={{ padding: "48px 52px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
      <div style={{ fontFamily: font.serif, fontSize: 150, lineHeight: 0.6, color: kleur.accent }}>“</div>
      <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 66, lineHeight: 1.15, color: kleur.text, opacity: p }}>{tekst}</div>
      {door && <div style={{ fontFamily: font.mono, fontSize: 24, letterSpacing: 2, textTransform: "uppercase", color: kleur.muted, opacity: p }}>— {door}</div>}
    </Frame>
  );
}

function Titel({ kop, sub, t }: { kop: string; sub?: string; t: number }) {
  const p = ease(t / 0.5);
  return (
    <div style={{ position: "absolute", inset: 0, padding: "30px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
      <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 86, lineHeight: 1.02, letterSpacing: -2, color: kleur.text }}>{kop}</div>
      {sub && (
        <div style={{ overflow: "hidden" }}>
          <div style={{ display: "inline-block", transform: `translateX(${(1 - p) * -100}%)`, background: kleur.accent, color: "#fff", padding: "14px 28px", borderRadius: 14, fontFamily: font.serif, fontSize: 96, lineHeight: 1, letterSpacing: 2, textTransform: "uppercase" }}>{sub}</div>
        </div>
      )}
    </div>
  );
}

export function Card({ kaart, t, sceneStart }: { kaart: Kaart; t: number; sceneStart: number }) {
  switch (kaart.type) {
    case "image":
      return <Beeld {...kaart} t={t} />;
    case "browser":
      return <Beeld {...kaart} balk={kaart.url} t={t} />;
    case "terminal":
      return <Terminal {...kaart} t={t} />;
    case "counter":
      return <Counter {...kaart} t={t} />;
    case "list":
      return <Lijst {...kaart} t={t} />;
    case "quote":
      return <Citaat {...kaart} t={t} />;
    case "title":
      return <Titel {...kaart} t={t - sceneStart} />;
    default:
      return null;
  }
}
