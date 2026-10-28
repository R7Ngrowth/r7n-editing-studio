// De spreker in R7N Paper: een papieren kaart met zachte schaduw (split/hook), beeldvullend (close) of weggeschoven (full).
import { OffthreadVideo, staticFile } from "remotion";
import { H, W, kleur } from "./theme";
import type { Meta } from "./types";

type Box = { x: number; y: number; w: number; h: number; r: number };

export function Speaker({ meta, box, stand }: { meta: Meta; box: Box | "vol" | "weg"; stand: number; t: number }) {
  const [fx, fy] = meta.spreker.focus;
  const bron = meta.spreker.alpha ? "speaker_alpha.mov" : "speaker.mp4";

  if (box === "vol") {
    const z = meta.spreker.zoomClose;
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: kleur.bg, opacity: stand }}>
        <OffthreadVideo src={staticFile("speaker.mp4")} muted style={{ position: "absolute", width: W, height: H, objectFit: "cover", transform: `scale(${z})`, transformOrigin: `${fx * 100}% ${fy * 100}%` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.72) 100%)" }} />
      </div>
    );
  }

  const b = box === "weg" ? { x: 90, y: 1300, w: 900, h: 720, r: 36 } : box;
  const y = b.y + (1 - stand) * (H - b.y + 40);
  const schaal = Math.max(b.w / W, b.h / H) * meta.spreker.zoomBox;
  const vw = W * schaal;
  const vh = H * schaal;
  const left = b.w / 2 - fx * vw;
  const top = b.h * 0.42 - fy * vh;
  const video = <OffthreadVideo src={staticFile(bron)} muted transparent={meta.spreker.alpha} style={{ position: "absolute", left, top, width: vw, height: vh }} />;
  return (
    <div style={{ position: "absolute", left: b.x, top: y, width: b.w, height: b.h }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: b.r, background: kleur.surface2, border: `1.5px solid ${kleur.line}`, boxShadow: "0 2px 0 rgba(23,22,26,.06), 0 24px 60px rgba(60,40,10,.16)", overflow: "hidden" }}>
        {!meta.spreker.alpha && video}
      </div>
      {meta.spreker.alpha && (
        <div style={{ position: "absolute", left: 0, top: -400, width: b.w, height: b.h + 400, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 400, width: b.w, height: b.h }}>{video}</div>
        </div>
      )}
      {/* papieren hoekje: klein oranje tabje linksboven */}
      <div style={{ position: "absolute", left: 28, top: -14, width: 70, height: 28, borderRadius: 6, background: kleur.accent, transform: "rotate(-4deg)", boxShadow: "0 3px 8px rgba(0,0,0,.18)" }} />
    </div>
  );
}
