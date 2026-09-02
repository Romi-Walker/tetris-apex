import type { GameSnapshot } from "../engine";
import { EMPTY, GRID_LINE, PIECE_COLORS, WELL_BG } from "./colors";

export function createRenderer(canvas: HTMLCanvasElement): {
  draw(snapshot: GameSnapshot): void;
} {
  const maybeCtx = canvas.getContext("2d");
  if (!maybeCtx) {
    throw new Error("Canvas 2D context unavailable");
  }
  const ctx: CanvasRenderingContext2D = maybeCtx;

  function draw(snapshot: GameSnapshot): void {
    const visibleRows = snapshot.rows - snapshot.visibleStartRow;
    const cellW = canvas.width / snapshot.cols;
    const cellH = canvas.height / visibleRows;

    ctx.fillStyle = WELL_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let vy = 0; vy < visibleRows; vy++) {
      const gy = vy + snapshot.visibleStartRow;
      const row = snapshot.grid[gy];
      for (let x = 0; x < snapshot.cols; x++) {
        const px = x * cellW;
        const py = vy * cellH;
        const cell = row ? row[x] ?? null : null;
        ctx.fillStyle = cell ? PIECE_COLORS[cell] : EMPTY;
        ctx.fillRect(px + 1, py + 1, cellW - 2, cellH - 2);
      }
    }

    if (snapshot.active && snapshot.ghost.length > 0) {
      const color = PIECE_COLORS[snapshot.active.type];
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = color;
      for (const cell of snapshot.ghost) {
        if (cell.y < snapshot.visibleStartRow) continue;
        const vy = cell.y - snapshot.visibleStartRow;
        ctx.fillRect(cell.x * cellW + 1, vy * cellH + 1, cellW - 2, cellH - 2);
      }
      ctx.restore();
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.5;
      for (const cell of snapshot.ghost) {
        if (cell.y < snapshot.visibleStartRow) continue;
        const vy = cell.y - snapshot.visibleStartRow;
        ctx.strokeRect(cell.x * cellW + 2, vy * cellH + 2, cellW - 4, cellH - 4);
      }
      ctx.globalAlpha = 1;
    }

    if (snapshot.active) {
      ctx.fillStyle = PIECE_COLORS[snapshot.active.type];
      for (const cell of snapshot.active.cells) {
        if (cell.y < snapshot.visibleStartRow) continue;
        const vy = cell.y - snapshot.visibleStartRow;
        const px = cell.x * cellW;
        const py = vy * cellH;
        ctx.fillRect(px + 1, py + 1, cellW - 2, cellH - 2);
      }
    }

    ctx.strokeStyle = GRID_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= snapshot.cols; x++) {
      const px = x * cellW;
      ctx.moveTo(px, 0);
      ctx.lineTo(px, canvas.height);
    }
    for (let y = 0; y <= visibleRows; y++) {
      const py = y * cellH;
      ctx.moveTo(0, py);
      ctx.lineTo(canvas.width, py);
    }
    ctx.stroke();
  }

  return { draw };
}
