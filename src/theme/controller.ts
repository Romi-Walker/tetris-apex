import {
  FADE_MAX_MS,
  FADE_MIN_MS,
  LEVEL_UP_SWITCH_CHANCE,
  PIECES_WITHOUT_LEVELUP,
  THEME_IDS,
  type ThemeId,
} from "./ids";
import { lerpPalette } from "./lerp";
import { paletteOf, type ThemePalette } from "./palettes";

export interface ThemeControllerOptions {
  rng?: () => number;
  now?: () => number;
}

export interface ThemeObserveInput {
  level: number;
  piecesLocked: number;
}

export interface ThemeController {
  currentId(): ThemeId;
  observe(snapshot: ThemeObserveInput): void;
  palette(at?: number): ThemePalette;
  fading(at?: number): boolean;
}

function pickIndex(length: number, rng: () => number): number {
  if (length <= 0) return 0;
  const i = Math.floor(rng() * length);
  if (i >= length) return length - 1;
  if (i < 0) return 0;
  return i;
}

export function pickTheme(rng: () => number): ThemeId {
  return THEME_IDS[pickIndex(THEME_IDS.length, rng)]!;
}

export function pickNextTheme(current: ThemeId, rng: () => number): ThemeId {
  const others = THEME_IDS.filter((id) => id !== current);
  return others[pickIndex(others.length, rng)]!;
}

/** 70% switch on level-up. rng=1 always switches; rng=0 never (uniform [0,1)). */
export function rollLevelUpSwitch(
  rng: () => number,
  chance = LEVEL_UP_SWITCH_CHANCE,
): boolean {
  return rng() >= 1 - chance;
}

export function createThemeController(
  options: ThemeControllerOptions = {},
): ThemeController {
  const rng = options.rng ?? Math.random;
  const nowFn = options.now ?? Date.now;

  let current: ThemeId = pickTheme(rng);
  let from: ThemeId | null = null;
  let fadeStart = 0;
  let fadeDuration = FADE_MIN_MS;

  let primed = false;
  let lastLevel = 1;
  let lastPiecesLocked = 0;
  let piecesSinceLevelUp = 0;

  function beginSwitch(): void {
    const next = pickNextTheme(current, rng);
    from = current;
    current = next;
    fadeStart = nowFn();
    fadeDuration = FADE_MIN_MS + rng() * (FADE_MAX_MS - FADE_MIN_MS);
  }

  function fadeT(at: number): number {
    if (!from) return 1;
    const t = (at - fadeStart) / fadeDuration;
    if (t >= 1) {
      from = null;
      return 1;
    }
    return t < 0 ? 0 : t;
  }

  function observe(snapshot: ThemeObserveInput): void {
    if (!primed) {
      primed = true;
      lastLevel = snapshot.level;
      lastPiecesLocked = snapshot.piecesLocked;
      piecesSinceLevelUp = 0;
      return;
    }

    if (snapshot.piecesLocked < lastPiecesLocked || snapshot.level < lastLevel) {
      lastLevel = snapshot.level;
      lastPiecesLocked = snapshot.piecesLocked;
      piecesSinceLevelUp = 0;
      return;
    }

    const levelUp = snapshot.level > lastLevel;
    const pieceDelta = snapshot.piecesLocked - lastPiecesLocked;
    lastLevel = snapshot.level;
    lastPiecesLocked = snapshot.piecesLocked;

    if (levelUp) {
      piecesSinceLevelUp = 0;
      if (rollLevelUpSwitch(rng)) {
        beginSwitch();
      }
      return;
    }

    piecesSinceLevelUp += pieceDelta;
    if (piecesSinceLevelUp >= PIECES_WITHOUT_LEVELUP) {
      beginSwitch();
      piecesSinceLevelUp = 0;
    }
  }

  function palette(at?: number): ThemePalette {
    const tnow = at ?? nowFn();
    const dest = paletteOf(current);
    if (!from) return dest;
    const t = fadeT(tnow);
    if (t >= 1 || !from) return dest;
    return lerpPalette(paletteOf(from), dest, t);
  }

  function fading(at?: number): boolean {
    const tnow = at ?? nowFn();
    return fadeT(tnow) < 1;
  }

  return {
    currentId: () => current,
    observe,
    palette,
    fading,
  };
}
