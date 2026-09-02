/** WCAG relative luminance helpers. Engine-independent. */

export function srgbToLinear(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: { r: number; g: number; b: number }): number {
  return (
    0.2126 * srgbToLinear(color.r) +
    0.7152 * srgbToLinear(color.g) +
    0.0722 * srgbToLinear(color.b)
  );
}

/** Absolute difference in relative luminance between two colors. */
export function minLumaDiff(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
): number {
  return Math.abs(relativeLuminance(a) - relativeLuminance(b));
}
