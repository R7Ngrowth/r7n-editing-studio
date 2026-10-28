// Kaarten van R7N Clean: afbeelding en browser, chatpaneel dat meetypt (terminal én typing), teller, lijst met 3D-achtige iconen, citaat, titel.
import { Img, staticFile } from "remotion";
import { ease, font, kleur } from "../theme";
import type { Camera, Kaart, Markeer, Regel } from "../types";
import { Extra, TerminalExtra, TerminalTeller } from "./Extra";
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
              <div style={{ position: "absolute", inset: 0, border: `5px solid ${kleur.accent}`, borderRadius: 18, boxShadow: `0 0 0 8px ${kleur.accent}22` }} />
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
        <div style={{ height: 70, display: "flex", alignItems: "center", gap: 10, padding: "0 26px", background: kleur.surface2 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((k) => (
            <span key={k} style={{ width: 16, height: 16, borderRadius: 8, background: k }} />
          ))}
          <span style={{ marginLeft: 14, flex: 1, height: 40, borderRadius: 12, background: kleur.surface, color: kleur.muted, fontFamily: font.sans, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{balk}</span>
        </div>
      )}
      <div style={{ position: "absolute", top: balk !== undefined ? 70 : 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${c.s})`, transformOrigin: `${c.x * 100}% ${c.y * 100}%` }}>
          <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          <Markeringen lijst={markeer} t={t} />
        </div>
      </div>
    </Frame>
  );
}

// Chatpaneel: regels als berichten; `cmd` typt mee als vraag, `uit`/`ok`/`fout` als antwoordkaartjes.
function Paneel({ titel, regels, teller, t }: { titel?: string; regels: Regel[]; teller?: { label: string; tot: number; start: number; duur?: number }; t: number }) {
  return (
    <Frame style={{ background: kleur.surface2 }}>
      <div style={{ height: 76, display: "flex", alignItems: "center", gap: 14, padding: "0 30px", background: kleur.surface, borderBottom: `1px solid ${kleur.line}` }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${kleur.accent}, #8aa0ff)` }} />
        <span style={{ fontFamily: font.sans, fontWeight: 600, fontSize: 26, color: kleur.text }}>{titel ?? "Assistent"}</span>
        <TerminalTeller teller={teller} t={t} />
      </div>
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
        {regels
          .filter((r) => t >= r.start)
          .map((r, i) => {
            const soort = r.soort ?? "uit";
            if (soort === "weg" || soort === "balk")
              return (
                <div key={i} style={{ padding: "12px 22px", borderRadius: 20, background: kleur.surface, fontFamily: font.sans, fontSize: 28 }}>
                  <TerminalExtra r={r} t={t} kleurTekst={kleur.text} />
                </div>
              );
            const vraag = soort === "cmd";
            const p = vraag ? Math.min(1, (t - r.start) / 0.7) : ease((t - r.start) / 0.3);
            const tekst = vraag ? r.t.slice(0, Math.ceil(r.t.length * p)) : r.t;
            return (
              <div key={i} style={{ display: "flex", justifyContent: vraag ? "flex-end" : "flex-start", opacity: vraag ? 1 : p, transform: vraag ? undefined : `translateY(${(1 - p) * 16}px)` }}>
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "16px 22px",
                    borderRadius: 24,
                    background: vraag ? kleur.accent : kleur.surface,
                    color: vraag ? "#fff" : soort === "ok" ? kleur.ok : soort === "fout" ? kleur.bad : kleur.text,
                    fontFamily: font.sans,
                    fontSize: 30,
                    lineHeight: 1.35,
                    boxShadow: vraag ? "none" : "0 4px 14px rgba(20,30,80,.08)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {soort === "ok" && "✓ "}
                  {soort === "fout" && "✗ "}
                  {tekst}
                  {vraag && p < 1 && <span style={{ opacity: 0.8 }}>▍</span>}
                </div>
              </div>
            );
          })}
      </div>
    </Frame>
  );
}

function Counter({ label, tot, start, duur = 1.4, prefix = "", suffix = "", t }: { label: string; tot: number; start: number; duur?: number; prefix?: string; suffix?: string; t: number }) {
  const p = ease((t - start) / duur);
  const klaar = p >= 1;
  return (
    <Frame style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
      <Pil>{label}</Pil>
      <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 200, letterSpacing: -8, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: klaar ? kleur.accent : kleur.text, transform: `scale(${klaar ? 1.04 : 1})` }}>
        {prefix}
        {nlGetal(tot * p)}
        {suffix}
      </div>
    </Frame>
  );
}

function Lijst({ titel, items, t }: { titel?: string; items: { t: string; start: number; icoon?: string }[]; t: number }) {
  return (
    <Frame style={{ padding: "44px 48px", display: "flex", flexDirection: "column", gap: 18 }}>
      {titel && <div style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 60, letterSpacing: -2, color: kleur.text, marginBottom: 10 }}>{titel}</div>}
      {items.map((it, i) => {
        const p = ease((t - it.start) / 0.4);
        if (t < it.start) return null;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, opacity: p, transform: `translateY(${(1 - p) * 24}px) scale(${0.96 + 0.04 * p})`, padding: "16px 20px", borderRadius: 26, background: kleur.surface2 }}>
            <div style={{ width: 84, height: 84, borderRadius: 24, background: `linear-gradient(145deg, #ffffff, #dfe5ff)`, boxShadow: `inset 0 -4px 10px rgba(91,116,255,.25), 0 8px 18px rgba(20,30,80,.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontFamily: font.sans, fontWeight: 700, color: kleur.accent }}>{it.icoon ?? i + 1}</div>
            <div style={{ fontFamily: font.sans, fontWeight: 600, fontSize: 42, color: kleur.text, lineHeight: 1.15 }}>{it.t}</div>
          </div>
        );
      })}
    </Frame>
  );
}

function Citaat({ tekst, door, start = 0, t }: { tekst: string; door?: string; start?: number; t: number }) {
  const p = ease((t - start) / 0.4);
  return (
    <Frame style={{ padding: "52px 56px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
      <div style={{ fontFamily: font.serif, fontSize: 150, lineHeight: 0.6, color: kleur.accent }}>“</div>
      <div style={{ fontFamily: font.sans, fontWeight: 600, fontSize: 60, letterSpacing: -1.5, lineHeight: 1.15, color: kleur.text, opacity: p }}>{tekst}</div>
      {door && <div style={{ fontFamily: font.sans, fontSize: 26, color: kleur.muted, opacity: p }}>— {door}</div>}
    </Frame>
  );
}

function Titel({ kop, sub, t }: { kop: string; sub?: string; t: number }) {
  const p = ease(t / 0.5);
  return (
    <Frame style={{ padding: "60px 56px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 26, background: `linear-gradient(160deg, #ffffff, ${kleur.surface2})` }}>
      <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 88, lineHeight: 1.02, letterSpacing: -3, color: kleur.text }}>{kop}</div>
      {sub && (
        <div style={{ overflow: "hidden" }}>
          <div style={{ display: "inline-block", transform: `translateX(${(1 - p) * -100}%)`, background: kleur.accent, color: "#fff", padding: "14px 30px", borderRadius: 999, fontFamily: font.sans, fontWeight: 600, fontSize: 60, lineHeight: 1, letterSpacing: -1 }}>{sub}</div>
        </div>
      )}
    </Frame>
  );
}

export function Card({ kaart, t, sceneStart }: { kaart: Kaart; t: number; sceneStart: number }) {
  switch (kaart.type) {
    case "image":
      return <Beeld {...kaart} t={t} />;
    case "browser":
      return <Beeld {...kaart} balk={kaart.url} t={t} />;
    case "terminal":
      return <Paneel {...kaart} t={t} />;
    case "counter":
      return <Counter {...kaart} t={t} />;
    case "list":
      return <Lijst {...kaart} t={t} />;
    case "quote":
      return <Citaat {...kaart} t={t} />;
    case "title":
      return <Titel {...kaart} t={t - sceneStart} />;
    default:
      return <Extra kaart={kaart} t={t} sceneStart={sceneStart} />;
  }
}
