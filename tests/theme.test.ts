import { describe, expect, it } from "vitest";
import {
  THEME_IDS,
  createThemeController,
  minLumaDiff,
  paletteOf,
  pickNextTheme,
  rollLevelUpSwitch,
} from "../src/theme";

describe("theme start", () => {
  it("picks a valid id", () => {
    const a = createThemeController({ rng: () => 0, now: () => 0 });
    const b = createThemeController({ rng: () => 1, now: () => 0 });
    const c = createThemeController({ rng: () => 0.5, now: () => 0 });
    expect(THEME_IDS.includes(a.currentId())).toBe(true);
    expect(THEME_IDS.includes(b.currentId())).toBe(true);
    expect(THEME_IDS.includes(c.currentId())).toBe(true);
  });
});

describe("theme switch uniqueness", () => {
  it("never picks the same theme twice in a row", () => {
    for (const current of THEME_IDS) {
      for (const roll of [0, 0.2, 0.5, 0.8, 1]) {
        expect(pickNextTheme(current, () => roll)).not.toBe(current);
      }
    }

    const ctrl = createThemeController({ rng: () => 0, now: () => 0 });
    ctrl.observe({ level: 1, piecesLocked: 0 });
    let last = ctrl.currentId();
    for (let i = 1; i <= 24; i++) {
      ctrl.observe({ level: 1, piecesLocked: i * 40 });
      const id = ctrl.currentId();
      expect(id).not.toBe(last);
      last = id;
    }
  });
});

describe("forced switch after 40 pieces", () => {
  it("switches after 40 locks without a level-up and resets the counter", () => {
    const ctrl = createThemeController({ rng: () => 0, now: () => 0 });
    const start = ctrl.currentId();
    ctrl.observe({ level: 1, piecesLocked: 0 });
    ctrl.observe({ level: 1, piecesLocked: 39 });
    expect(ctrl.currentId()).toBe(start);
    ctrl.observe({ level: 1, piecesLocked: 40 });
    const afterForce = ctrl.currentId();
    expect(afterForce).not.toBe(start);
    ctrl.observe({ level: 1, piecesLocked: 79 });
    expect(ctrl.currentId()).toBe(afterForce);
    ctrl.observe({ level: 1, piecesLocked: 80 });
    expect(ctrl.currentId()).not.toBe(afterForce);
  });
});

describe("level-up switch chance", () => {
  it("rng=1 always switches on level-up", () => {
    expect(rollLevelUpSwitch(() => 1)).toBe(true);
    const ctrl = createThemeController({ rng: () => 1, now: () => 0 });
    const start = ctrl.currentId();
    ctrl.observe({ level: 1, piecesLocked: 0 });
    ctrl.observe({ level: 2, piecesLocked: 5 });
    expect(ctrl.currentId()).not.toBe(start);
  });

  it("rng=0 never switches on level-up except force", () => {
    expect(rollLevelUpSwitch(() => 0)).toBe(false);
    const ctrl = createThemeController({ rng: () => 0, now: () => 0 });
    const start = ctrl.currentId();
    ctrl.observe({ level: 1, piecesLocked: 0 });
    ctrl.observe({ level: 2, piecesLocked: 5 });
    expect(ctrl.currentId()).toBe(start);
    ctrl.observe({ level: 2, piecesLocked: 45 });
    expect(ctrl.currentId()).not.toBe(start);
  });
});

describe("theme reset", () => {
  it("reset() changes id and is not equal to previous", () => {
    const rolls = [0, 0.5, 0.9, 0.2, 0.7, 0.1];
    let i = 0;
    const rng = () => rolls[i++] ?? 0;
    const ctrl = createThemeController({ rng, now: () => 0 });
    const first = ctrl.currentId();
    ctrl.reset();
    const second = ctrl.currentId();
    expect(second).not.toBe(first);
    ctrl.reset();
    const third = ctrl.currentId();
    expect(third).not.toBe(second);
  });
});

describe("deep ocean contrast", () => {
  it("T vs empty exceeds 0.25 relative luminance", () => {
    const p = paletteOf("deep-ocean");
    expect(minLumaDiff(p.pieces.T, p.empty)).toBeGreaterThan(0.25);
  });
});
