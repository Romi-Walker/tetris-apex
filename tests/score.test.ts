import { describe, expect, it } from "vitest";
import { emptyGrid } from "../src/engine";
import {
  applyBackToBack,
  classifyTSpin,
  comboAward,
  detectTSpin,
  dropPoints,
  gravityMsForLevel,
  levelFromLines,
  lineClearBase,
  lockMsForLevel,
  perfectClearAward,
  scoreLock,
} from "../src/engine/score";

describe("line clears", () => {
  it("Single/Double/Triple/Tetris at level 1 and 2", () => {
    expect(lineClearBase(1, "none") * 1).toBe(100);
    expect(lineClearBase(2, "none") * 1).toBe(300);
    expect(lineClearBase(3, "none") * 1).toBe(500);
    expect(lineClearBase(4, "none") * 1).toBe(800);
    expect(lineClearBase(4, "none") * 2).toBe(1600);
    expect(scoreLock({
      lines: 1, tSpin: "none", level: 1, b2bReady: false, comboCount: 0, perfectClear: false,
    }).points).toBe(100);
    expect(scoreLock({
      lines: 4, tSpin: "none", level: 2, b2bReady: false, comboCount: 0, perfectClear: false,
    }).points).toBe(1600);
  });
});

describe("T-Spin awards", () => {
  it("Mini 100, T-Spin 400, Double 700, Triple 1100 times level", () => {
    expect(lineClearBase(0, "mini")).toBe(100);
    expect(lineClearBase(1, "mini")).toBe(100);
    expect(lineClearBase(0, "full")).toBe(400);
    expect(lineClearBase(1, "full")).toBe(400);
    expect(lineClearBase(2, "full")).toBe(700);
    expect(lineClearBase(3, "full")).toBe(1100);
    expect(scoreLock({
      lines: 1, tSpin: "mini", level: 2, b2bReady: false, comboCount: 0, perfectClear: false,
    }).points).toBe(200);
    expect(scoreLock({
      lines: 2, tSpin: "full", level: 2, b2bReady: false, comboCount: 0, perfectClear: false,
    }).points).toBe(1400);
  });
});

describe("back-to-back", () => {
  it("B2B Tetris is 800 * 1.5 = 1200 at level 1", () => {
    expect(applyBackToBack(800, true)).toBe(1200);
    expect(scoreLock({
      lines: 4, tSpin: "none", level: 1, b2bReady: true, comboCount: 0, perfectClear: false,
    }).points).toBe(1200);
  });

  it("starts B2B on Tetris and T-Spin with lines, breaks on normal single", () => {
    const tetris = scoreLock({
      lines: 4, tSpin: "none", level: 1, b2bReady: false, comboCount: 0, perfectClear: false,
    });
    expect(tetris.nextB2b).toBe(true);
    const single = scoreLock({
      lines: 1, tSpin: "none", level: 1, b2bReady: true, comboCount: 0, perfectClear: false,
    });
    expect(single.nextB2b).toBe(false);
    const miniZero = scoreLock({
      lines: 0, tSpin: "mini", level: 1, b2bReady: true, comboCount: 0, perfectClear: false,
    });
    expect(miniZero.nextB2b).toBe(true);
    expect(miniZero.points).toBe(100);
  });
});

describe("combo", () => {
  it("second consecutive single at level 1 adds 50", () => {
    expect(comboAward(0, 1)).toBe(0);
    expect(comboAward(1, 1)).toBe(50);
    const first = scoreLock({
      lines: 1, tSpin: "none", level: 1, b2bReady: false, comboCount: 0, perfectClear: false,
    });
    expect(first.points).toBe(100);
    expect(first.nextCombo).toBe(1);
    const second = scoreLock({
      lines: 1, tSpin: "none", level: 1, b2bReady: false, comboCount: 1, perfectClear: false,
    });
    expect(second.points).toBe(150);
  });
});

describe("perfect clear", () => {
  it("single 800 and tetris 2000 times level", () => {
    expect(perfectClearAward(1, 1)).toBe(800);
    expect(perfectClearAward(4, 1)).toBe(2000);
    expect(perfectClearAward(4, 2)).toBe(4000);
    expect(scoreLock({
      lines: 1, tSpin: "none", level: 1, b2bReady: false, comboCount: 0, perfectClear: true,
    }).points).toBe(900);
    expect(scoreLock({
      lines: 4, tSpin: "none", level: 2, b2bReady: false, comboCount: 0, perfectClear: true,
    }).points).toBe(1600 + 4000);
  });
});

describe("drops", () => {
  it("soft drop 1 per cell and hard drop 2 per cell are not multiplied by level", () => {
    expect(dropPoints(7, "soft")).toBe(7);
    expect(dropPoints(7, "hard")).toBe(14);
  });
});

describe("level", () => {
  it("10 lines -> level 2; 20 lines -> level 3", () => {
    expect(levelFromLines(0)).toBe(1);
    expect(levelFromLines(9)).toBe(1);
    expect(levelFromLines(10)).toBe(2);
    expect(levelFromLines(19)).toBe(2);
    expect(levelFromLines(20)).toBe(3);
  });

  it("gravity and lock delay tables", () => {
    expect(gravityMsForLevel(1)).toBe(800);
    expect(gravityMsForLevel(10)).toBe(100);
    expect(gravityMsForLevel(20)).toBe(0);
    expect(lockMsForLevel(1)).toBe(500);
    expect(lockMsForLevel(12)).toBe(400);
    expect(lockMsForLevel(20)).toBe(200);
  });
});

describe("T-Spin 3-corner", () => {
  it("classifies mini vs full from kick and corners", () => {
    expect(classifyTSpin(2, true, 0)).toBe("none");
    expect(classifyTSpin(3, false, 0)).toBe("full");
    expect(classifyTSpin(3, true, 0)).toBe("mini");
    expect(classifyTSpin(3, true, 1)).toBe("mini");
    expect(classifyTSpin(3, true, 2)).toBe("full");
    expect(classifyTSpin(4, true, 0)).toBe("full");
    expect(classifyTSpin(3, true, 3)).toBe("full");
  });

  it("detectTSpin requires T + last rotate + 3 corners", () => {
    const grid = emptyGrid();
    grid[19]![3] = "I";
    grid[21]![3] = "I";
    grid[21]![5] = "I";
    expect(
      detectTSpin({
        type: "T",
        x: 3,
        y: 19,
        lastAction: "rotate",
        usedKick: false,
        lines: 0,
        grid,
      }),
    ).toBe("full");
    expect(
      detectTSpin({
        type: "T",
        x: 3,
        y: 19,
        lastAction: "drop",
        usedKick: false,
        lines: 0,
        grid,
      }),
    ).toBe("none");
    expect(
      detectTSpin({
        type: "T",
        x: 3,
        y: 19,
        lastAction: "rotate",
        usedKick: true,
        lines: 0,
        grid,
      }),
    ).toBe("mini");
  });
});
