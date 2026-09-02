import { cellsOf, type PieceType } from "../engine";
import { css, type ThemePalette } from "../theme";

export function drawPiecePreview(
  canvas: HTMLCanvasElement,
  type: PieceType | null,
  palette: ThemePalette,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = css(palette.well);
  ctx.fillRect(0, 0, w, h);
  if (!type) return;

  const cells = cellsOf(type, 0, 0, 0);
  const minX = Math.min(...cells.map((c) => c.x));
  const maxX = Math.max(...cells.map((c) => c.x));
  const minY = Math.min(...cells.map((c) => c.y));
  const maxY = Math.max(...cells.map((c) => c.y));
  const pw = maxX - minX + 1;
  const ph = maxY - minY + 1;
  const pad = 6;
  const cell = Math.min((w - pad * 2) / 4, (h - pad * 2) / 4);
  const originX = (w - pw * cell) / 2;
  const originY = (h - ph * cell) / 2;

  ctx.fillStyle = css(palette.pieces[type]);
  for (const c of cells) {
    const px = originX + (c.x - minX) * cell;
    const py = originY + (c.y - minY) * cell;
    ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
  }
}
