// Wachtrij: nooit meer dan `maxParallel` Claude-sessies tegelijk, de rest wacht op zijn beurt.
import { CONFIG } from "./config.mjs";

const wachtend = [];
let lopend = 0;

export function plan(taak) {
  wachtend.push(taak);
  pomp();
}
function pomp() {
  while (lopend < Math.max(1, Number(CONFIG.maxParallel) || 1) && wachtend.length) {
    const taak = wachtend.shift();
    lopend++;
    Promise.resolve()
      .then(taak)
      .catch((e) => console.error("taak mislukt:", e?.message ?? e))
      .finally(() => {
        lopend--;
        pomp();
      });
  }
}
export const stand = () => ({ actief: lopend, wachtrij: wachtend.length });
