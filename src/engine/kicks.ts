import type { PieceType } from "./types";

type Kick = readonly [number, number];

/**
 * Tetris Guideline SRS wall-kicks, stored in engine space (x right, y down).
 * Published tables use +y up; conversion is engineKick = (kx, -ky).
 *
 * 180° uses the TETR.IO / SRS+ table (same y conversion).
 */
function fromGuidelineYUp(kicks: Kick[]): Kick[] {
  return kicks.map(([kx, ky]) => [kx, -ky] as const);
}

const JLSTZ_GUIDELINE_YUP: Record<string, Kick[]> = {
  "0-1": [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  "1-0": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  "1-2": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  "2-1": [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  "2-3": [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  "3-2": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  "3-0": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  "0-3": [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
};

const I_GUIDELINE_YUP: Record<string, Kick[]> = {
  "0-1": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  "1-0": [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  "1-2": [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
  "2-1": [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  "2-3": [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  "3-2": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  "3-0": [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  "0-3": [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
};

/** TETR.IO / SRS+ 180 kicks, published +y up. */
const JLSTZ_180_YUP: Record<string, Kick[]> = {
  "0-2": [
    [0, 0],
    [0, 1],
    [1, 1],
    [-1, 1],
    [1, 0],
    [-1, 0],
  ],
  "2-0": [
    [0, 0],
    [0, -1],
    [-1, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
  ],
  "1-3": [
    [0, 0],
    [1, 0],
    [1, 2],
    [1, 1],
    [0, 2],
    [0, 1],
  ],
  "3-1": [
    [0, 0],
    [-1, 0],
    [-1, 2],
    [-1, 1],
    [0, 2],
    [0, 1],
  ],
};

const I_180_YUP: Record<string, Kick[]> = {
  "0-2": [
    [0, 0],
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ],
  "2-0": [
    [0, 0],
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ],
  "1-3": [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ],
  "3-1": [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, 1],
    [0, -1],
  ],
};

const O_KICKS: Kick[] = [[0, 0]];

function tableKey(from: number, to: number): string {
  return `${from}-${to}`;
}

export function kicksFor(type: PieceType, fromRot: number, toRot: number): readonly Kick[] {
  if (type === "O") {
    return O_KICKS;
  }
  const key = tableKey(fromRot, toRot);
  const is180 = (fromRot + 2) % 4 === toRot;
  if (type === "I") {
    const src = is180 ? I_180_YUP[key] : I_GUIDELINE_YUP[key];
    return src ? fromGuidelineYUp(src) : O_KICKS;
  }
  const src = is180 ? JLSTZ_180_YUP[key] : JLSTZ_GUIDELINE_YUP[key];
  return src ? fromGuidelineYUp(src) : O_KICKS;
}
