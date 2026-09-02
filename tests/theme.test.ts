import { describe, expect, it } from "vitest";
import {
  THEME_IDS,
  createThemeController,
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
