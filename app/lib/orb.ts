// Standard-section orb. Ported from the design's drawOrb, with the palettes and cycle timing of the updated orb.
export type Palette = { a: number[]; b: number[]; g1: number[]; g2: number[] };

const hex = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
const pal = (a: string, b: string, g1: number[], g2: number[]): Palette => ({ a: hex(a), b: hex(b), g1, g2 });

export const ORB = {
  lilac: pal("#676ca0", "#764c93", [205, 190, 219, 0.5], [122, 149, 190, 0.95]),
  teal: pal("#3676a0", "#3d7aad", [167, 208, 224, 0.5], [63, 134, 182, 0.95]),
  coral: pal("#dc796c", "#cb7773", [231, 178, 163, 0.5], [229, 150, 143, 0.95]),
  dusk: pal("#a273a5", "#b8807f", [222, 208, 225, 0.5], [210, 160, 139, 0.95]),
  rose: pal("#8e5687", "#9b5a91", [226, 193, 210, 0.5], [185, 114, 158, 0.95]),
};

const mix = (A: number[], B: number[], f: number) => A.map((v, i) => v + (B[i] - v) * f);
const rgb = (c: number[]) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${c[3] ?? 1})`;

export function drawOrb(cv: HTMLCanvasElement, P: Palette[], t: number) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = cv.clientWidth;
  if (W && cv.width !== Math.round(W * dpr)) {
    cv.width = cv.height = Math.round(W * dpr);
  }
  const x = cv.getContext("2d");
  const S = cv.width;
  if (!x || !S) return;

  const seg = 8;
  const pos = t / seg;
  const i = ((Math.floor(pos) % P.length) + P.length) % P.length;
  const j = (i + 1) % P.length;
  // Hold each palette, then blend into the next over the last fifth of its segment.
  let f = Math.min(1, Math.max(0, (pos - Math.floor(pos) - 0.8) / 0.2));
  f = f * f * (3 - 2 * f);
  const p = {
    a: mix(P[i].a, P[j].a, f),
    b: mix(P[i].b, P[j].b, f),
    g1: mix(P[i].g1, P[j].g1, f),
    g2: mix(P[i].g2, P[j].g2, f),
  };

  const k = S / 800;
  const cx = S / 2;
  const cy = S / 2;
  const Rr = 380 * k;
  const th = Math.PI + t * ((2 * Math.PI) / 28);
  const dd = (95 + 20 * Math.sin(t * 0.35)) * k;
  const fx = cx + Math.cos(th) * dd;
  const fy = cy + Math.sin(th) * dd;
  const ux = -Math.cos(th);
  const uy = -Math.sin(th);

  x.clearRect(0, 0, S, S);
  x.save();
  x.beginPath();
  x.arc(cx, cy, Rr, 0, Math.PI * 2);
  x.clip();
  const g = x.createLinearGradient(cx - ux * Rr, cy - uy * Rr, cx + ux * Rr, cy + uy * Rr);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.45, rgb(p.g1));
  g.addColorStop(1, rgb(p.g2));
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);
  x.restore();

  const step = 28 * k;
  const rot = t * 0.06;
  const cr = Math.cos(rot);
  const sr = Math.sin(rot);
  const N = Math.ceil((Rr * 2) / step) + 2;
  for (let gy = -N; gy <= N; gy++) {
    for (let gx = -N; gx <= N; gx++) {
      const lx = gx * step;
      const ly = gy * step;
      const d0 = Math.hypot(lx, ly) / (Rr * 1.25);
      if (d0 >= 1) continue;
      const bulge = 1 - 0.18 * d0 * d0;
      const rx = (lx * cr - ly * sr) * bulge;
      const ry = (lx * sr + ly * cr) * bulge;
      const px = fx + rx;
      const py = fy + ry;
      if (Math.hypot(px - cx, py - cy) > Rr - 6 * k) continue;
      const r = Math.hypot(rx, ry);
      const fade = Math.max(0, 1 - Math.max(0, (px - cx) * ux + (py - cy) * uy) / (Rr * 0.75));
      const pulse = 1 + 0.07 * Math.sin(t * 1.1 - r / (45 * k));
      const sz = step * 0.44 * Math.pow(Math.max(0, 1 - r / (Rr * 1.1)), 0.9) * fade * pulse;
      if (sz < 0.6 * k) continue;
      const tt = Math.min(1, Math.max(0, ((px - cx) * -uy + (py - cy) * ux + Rr) / (Rr * 2)));
      x.fillStyle = rgb(mix(p.a, p.b, tt));
      x.beginPath();
      x.arc(px, py, sz, 0, Math.PI * 2);
      x.fill();
    }
  }
}
