import type { PieceType } from "../engine";

export const PIECE_COLORS: Record<PieceType, string> = {
  I: "#00d5d8",
  O: "#e0c040",
  T: "#b44ae0",
  S: "#3cc85a",
  Z: "#e04545",
  J: "#3a6bdc",
  L: "#e08930",
};

export const EMPTY = "#12141a";
export const GRID_LINE = "rgba(255, 255, 255, 0.06)";
export const WELL_BG = "#0b0c10";
