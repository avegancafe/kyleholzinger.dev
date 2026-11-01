/*
 * scroll-art.js: <scroll-art piece="…"> is <ascii-art> for the wedding site's
 * portraits, with one difference: in hacker mode the picture shuffles a
 * little as you scroll. Each cell can slip one step up or down the character
 * ramp and the odd row slides a column, more while you are scrolling, almost
 * not at all once you stop. Minor differences, same picture.
 *
 * It takes the same attributes as <ascii-art> (piece, size, look, chars,
 * mono, contrast, still) and the same custom properties (--ascii-size,
 * --ascii-ink), plus --ascii-font for the face, and renders with the
 * runtime's own restyle() and frameHTML(), so the output matches the
 * runtime's text rendering exactly when nothing is shuffling. Site-specific;
 * not part of the ascii-magic-art plugin.
 *
 *   data-shuffle="hack"    (default) shuffle only while <html data-theme="hacker">
 *   data-shuffle="always"  shuffle in both themes
 *   data-shuffle="never"   plain player
 */
import { restyle, LOOKS, ramp } from "./runtime/glyphs.js";
import { frameHTML } from "./runtime/player.js";

const BASE = new URL(".", import.meta.url).href;
const LEVELS = "▁▂▃▄▅▆▇█";
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

const hash = (x, y, n) => {
  let h = (x * 374761393 + y * 668265263 + n * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/* ── one scroll clock for every portrait on the page ─────────────────────── */
const live = new Set();
let lastY = scrollY, velocity = 0, bucket = 0, rafId = 0;

function schedule() {
  if (!rafId) rafId = requestAnimationFrame(loop);
}

function loop(now) {
  rafId = 0;
  const y = scrollY, dy = Math.abs(y - lastY);
  lastY = y;
  velocity = velocity * 0.85 + dy * 0.3;
  if (velocity < 0.05) velocity = 0;
  bucket = Math.floor(y / 18);
  for (const el of live) el.frame(now);
  if (live.size) schedule();
}

addEventListener("scroll", schedule, { passive: true });

/* ── the shuffle ─────────────────────────────────────────────────────────── */
function jitter(out, lk, intensity) {
  const str = typeof out === "string";
  const text = str ? out : out.text;
  const chars = lk.look ? LOOKS[lk.look] && LOOKS[lk.look].chars : lk.chars;
  const R = [...(chars ? ramp(chars) : LEVELS)];
  const idx = new Map(R.map((c, i) => [c, i]));
  // one visible step: a single rung on a short ramp, a few on the 70-char dense one
  const step = Math.max(1, Math.round(R.length / 14));
  const rows = text.split("\n");
  const colorRows = str ? null : out.color.split("\n");
  for (let y = 0; y < rows.length; y++) {
    let cells = [...rows[y]];
    let col = colorRows ? [...colorRows[y]] : null;
    // the odd row slides one column, wrapping, like a tear in the signal
    const r = hash(y, bucket, 7);
    if (r < intensity * 0.15) {
      const left = r < intensity * 0.075;
      cells = left ? [...cells.slice(1), cells[0]] : [cells[cells.length - 1], ...cells.slice(0, -1)];
      if (col) col = left ? [...col.slice(1), col[0]] : [col[col.length - 1], ...col.slice(0, -1)];
    }
    // a few cells slip one step along the ramp; spaces stay spaces
    for (let x = 0; x < cells.length; x++) {
      const c = cells[x];
      if (c === " ") continue;
      const i = idx.get(c);
      if (i === undefined) continue;
      if (hash(x, y, bucket) >= intensity) continue;
      const j = i + (hash(y, x, bucket + 1) < 0.5 ? -step : step);
      if (j < 1 || j >= R.length) continue;
      cells[x] = R[j];
    }
    rows[y] = cells.join("");
    if (col) colorRows[y] = col.join("");
  }
  return str ? rows.join("\n") : { ...out, text: rows.join("\n"), color: colorRows.join("\n") };
}

/* ── the element ─────────────────────────────────────────────────────────── */
class ScrollArt extends HTMLElement {
  static get observedAttributes() { return ["piece", "size", "look", "chars", "mono", "contrast", "still"]; }
  connectedCallback() { this.setup(); this.start(); }
  disconnectedCallback() { this.stop(); }
  attributeChangedCallback(name) {
    if (!this.isConnected || !this.pre) return;
    if (name === "size") { this.applySize(); return; }   // the fit script resizes often; no restart needed
    if (name === "still") { this.lastKey = ""; schedule(); return; }
    this.start();
  }

  setup() {
    if (this.pre) return;
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `<style>
      :host{display:inline-block;max-width:100%;overflow:hidden}
      pre{margin:0;font:var(--ascii-size,12px)/1 var(--ascii-font,Menlo,Consolas,"DejaVu Sans Mono","Liberation Mono",monospace);letter-spacing:0;white-space:pre;color:var(--ascii-ink,currentColor)}
    </style><pre aria-hidden="true"></pre>`;
    this.pre = root.querySelector("pre");
    this.setAttribute("role", "img");
  }

  applySize() {
    this.style.setProperty("--ascii-size", (parseFloat(this.getAttribute("size")) || 12) + "px");
  }

  async start() {
    this.stop();
    this.applySize();
    const slug = (this.getAttribute("piece") || "").replace(/[^a-z0-9-]/g, "");
    if (!slug) return;
    const gen = (this.gen = (this.gen || 0) + 1);
    try {
      const mod = await import(`${BASE}pieces/${slug}.js`);
      if (gen !== this.gen) return;
      this.meta = mod.meta;
      this.draw = mod.default();
      if (!this.getAttribute("aria-label")) this.setAttribute("aria-label", mod.meta.name + ", animated ASCII art");
    } catch (e) {
      this.pre.textContent = `scroll-art: no piece "${slug}"`;
      return;
    }
    this.t0 = performance.now();
    this.lastRender = -1;
    this.lastKey = "";
    this.io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { live.add(this); schedule(); } else live.delete(this);
      }
    });
    this.io.observe(this);
    this.render(0, 0);
  }

  stop() {
    if (this.io) this.io.disconnect();
    this.io = null;
    live.delete(this);
  }

  get look() {
    return {
      look: this.getAttribute("look") || undefined,
      chars: this.getAttribute("chars") || undefined,
      mono: this.hasAttribute("mono"),
      gamma: this.hasAttribute("contrast") ? 0.35 + ((parseFloat(this.getAttribute("contrast")) || 0) / 100) * 0.8 : undefined,
    };
  }

  /* called every animation frame while on screen; renders only when something changed */
  frame(now) {
    if (!this.draw) return;
    const still = this.hasAttribute("still") || reduced.matches;
    const mode = this.dataset.shuffle || "hack";
    const shuffling = !reduced.matches && mode !== "never" && (mode === "always" || document.documentElement.dataset.theme === "hacker");
    const intensity = shuffling ? Math.min(0.3, 0.03 + velocity / 180) : 0;
    const key = bucket + "|" + intensity.toFixed(2) + "|" + still;
    const timeDue = !still && now - this.lastRender >= 100;   // the piece's own motion, at 10 fps
    if (!timeDue && key === this.lastKey) return;
    this.lastRender = now;
    this.lastKey = key;
    this.render(still ? 0 : (now - this.t0) / 1000, intensity);
  }

  render(t, intensity) {
    const lk = this.look;
    let out = restyle(this.draw(t), this.meta.palette, lk);
    if (intensity > 0) out = jitter(out, lk, intensity);
    const palette = typeof out === "string" ? null : out.palette || this.meta.palette;
    this.pre.innerHTML = frameHTML(out, palette);
  }
}

if (!customElements.get("scroll-art")) customElements.define("scroll-art", ScrollArt);
