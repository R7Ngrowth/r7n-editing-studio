// De spreker in R7N Clean: een grote afgeronde kaart die de onderste helft vult (split/hook), beeldvullend (close) of weg (full).
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
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.7) 100%)" }} />
      </div>
    );
  }

  const b = box === "weg" ? { x: 80, y: 1000, w: 920, h: 800, r: 56 } : box;
  const y = b.y + (1 - stand) * (H - b.y + 40);
  const schaal = Math.max(b.w / W, b.h / H) * meta.spreker.zoomBox;
  const vw = W * schaal;
  const vh = H * schaal;
  const left = b.w / 2 - fx * vw;
  const top = b.h * 0.4 - fy * vh;
  const video = <OffthreadVideo src={staticFile(bron)} muted transparent={meta.spreker.alpha} style={{ position: "absolute", left, top, width: vw, height: vh }} />;
  return (
    <div style={{ position: "absolute", left: b.x, top: y, width: b.w, height: b.h }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: b.r, background: kleur.surface2, boxShadow: "0 30px 90px rgba(20,30,80,.16), 0 8px 24px rgba(20,30,80,.06)", overflow: "hidden" }}>
        {!meta.spreker.alpha && video}
        {/* zacht verloop onderin zodat de witte ondertitel leesbaar blijft */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "45%", background: "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.55))" }} />
      </div>
      {meta.spreker.alpha && (
        <div style={{ position: "absolute", left: 0, top: -400, width: b.w, height: b.h + 400, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 400, width: b.w, height: b.h }}>{video}</div>
        </div>
      )}
    </div>
  );
}
