import type { GameSnapshot, PieceType } from "../engine";

const COLORS: Record<PieceType, string> = {
  I: "#00d5d8",
  O: "#e0c040",
  T: "#b44ae0",
  S: "#3cc85a",
  Z: "#e04545",
  J: "#3a6bdc",
  L: "#e08930",
};

const EMPTY = "#12141a";
const GRID_LINE = "rgba(255, 255, 255, 0.06)";
const WELL_BG = "#0b0c10";

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
        ctx.fillStyle = cell ? COLORS[cell] : EMPTY;
        ctx.fillRect(px + 1, py + 1, cellW - 2, cellH - 2);
      }
    }

    if (snapshot.active) {
      ctx.fillStyle = COLORS[snapshot.active.type];
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
