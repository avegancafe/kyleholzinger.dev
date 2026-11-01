/* kyle-and-elise: wedding lettering for kyleholzinger.dev/wedding. A 5x7 block
 * font spells the couple's names; a band of light sweeps slowly across the
 * letters like a glint on a print, and the ampersand beats. */
import { Grid, palette } from "../lib/kit.js";

const FONT = {
  K: ["█   █", "█  █ ", "█ █  ", "██   ", "█ █  ", "█  █ ", "█   █"],
  Y: ["█   █", "█   █", " █ █ ", "  █  ", "  █  ", "  █  ", "  █  "],
  L: ["█    ", "█    ", "█    ", "█    ", "█    ", "█    ", "█████"],
  E: ["█████", "█    ", "█    ", "████ ", "█    ", "█    ", "█████"],
  I: ["█████", "  █  ", "  █  ", "  █  ", "  █  ", "  █  ", "█████"],
  S: [" ████", "█    ", "█    ", " ███ ", "    █", "    █", "████ "],
  "&": [" ██  ", "█  █ ", "█  █ ", " ██  ", "█  █ █", "█   █ ", " ███ █"],
  " ": ["     ", "     ", "     ", "     ", "     ", "     ", "     "],
};
const TEXT = "KYLE & ELISE";
const W = TEXT.length * 6 - 1, H = 9;

export const meta = {
  slug: "kyle-and-elise",
  name: "Kyle and Elise Lettering",
  category: "lettering",
  note: "KYLE & ELISE in a block font, a slow band of light crossing the letters while the ampersand beats.",
  tags: ["wedding", "lettering", "names", "banner"],
  cols: W, rows: H, fps: 24,
  // 0 deep, 1 mid, 2 light cyanotype blues; 3 the red ampersand, 4 its glow
  palette: palette(["#0d2b52", "#3f6f9c", "#8fb0cf", "#e61919", "#f08a8a"]),
};

export default function create() {
  const g = new Grid(W, H);
  return (t) => {
    g.clear();
    const sweep = ((t * 0.18) % 1.4) * (W + 20) - 10; // left to right, pause between passes
    const beat = Math.pow(Math.max(0, Math.sin(t * 2.4)), 6);
    let x = 0;
    for (const ch of TEXT) {
      const rows = FONT[ch] || FONT[" "];
      for (let r = 0; r < 7; r++) {
        const row = rows[r];
        for (let c = 0; c < row.length; c++) {
          if (row[c] === " ") continue;
          const px = x + c, py = r + 1;
          if (ch === "&") { g.set(px, py, beat > 0.5 ? "▓" : "█", beat > 0.5 ? "4" : "3"); continue; }
          const d = Math.abs(px + r * 0.6 - sweep);
          g.set(px, py, d < 2 ? "▒" : d < 5 ? "▓" : "█", d < 2 ? "2" : d < 5 ? "1" : "0");
        }
      }
      x += 6;
    }
    return g.frame();
  };
}
