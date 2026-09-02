export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function rgb(r: number, g: number, b: number, a = 1): Rgba {
  return { r, g, b, a };
}

export function css(c: Rgba): string {
  const r = Math.round(c.r);
  const g = Math.round(c.g);
  const b = Math.round(c.b);
  const a = Math.round(c.a * 1000) / 1000;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp01(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}

export function lerpRgba(a: Rgba, b: Rgba, t: number): Rgba {
  return {
    r: lerp(a.r, b.r, t),
    g: lerp(a.g, b.g, t),
    b: lerp(a.b, b.b, t),
    a: lerp(a.a, b.a, t),
  };
}

export function opaque(c: Rgba): Rgba {
  return { r: c.r, g: c.g, b: c.b, a: 1 };
}
