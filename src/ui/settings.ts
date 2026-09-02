import type { ColorblindMode } from "../theme";

export const SETTINGS_KEY = "tetris-apex-settings";
export const HOWTO_SEEN_KEY = "tetris-apex-howto-seen";

export type ControlId =
  | "left"
  | "right"
  | "soft"
  | "hard"
  | "cw"
  | "ccw"
  | "flip"
  | "hold"
  | "pause";

export type KeyRemap = Partial<Record<ControlId, string>>;

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  mute: boolean;
  dasMs: number;
  arrMs: number;
  ghost: boolean;
  grid: boolean;
  remap: KeyRemap;
  colorblind: ColorblindMode;
  reduceMotion: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 70,
  sfxVolume: 80,
  musicVolume: 55,
  mute: false,
  dasMs: 133,
  arrMs: 33,
  ghost: true,
  grid: true,
  remap: {},
  colorblind: "off",
  reduceMotion: false,
};

export const CONTROL_IDS: readonly ControlId[] = [
  "left",
  "right",
  "soft",
  "hard",
  "cw",
  "ccw",
  "flip",
  "hold",
  "pause",
];

export const DEFAULT_BINDINGS: Record<ControlId, readonly string[]> = {
  left: ["ArrowLeft"],
  right: ["ArrowRight"],
  soft: ["ArrowDown"],
  hard: ["Space"],
  cw: ["ArrowUp", "KeyX"],
  ccw: ["KeyZ", "ControlLeft", "ControlRight"],
  flip: ["KeyA"],
  hold: ["KeyC", "ShiftLeft", "ShiftRight"],
  pause: ["Escape"],
};

export interface SettingsStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const COLORBLIND: readonly ColorblindMode[] = [
  "off",
  "deuteranopia",
  "protanopia",
  "high-contrast",
];

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asColorblind(value: unknown): ColorblindMode {
  if (typeof value === "string" && (COLORBLIND as readonly string[]).includes(value)) {
    return value as ColorblindMode;
  }
  return "off";
}

function asRemap(value: unknown): KeyRemap {
  if (!value || typeof value !== "object") return {};
  const rec = value as Record<string, unknown>;
  const out: KeyRemap = {};
  for (const id of CONTROL_IDS) {
    const code = rec[id];
    if (typeof code === "string" && code.length > 0) {
      out[id] = code;
    }
  }
  return out;
}

export function normalizeSettings(raw: unknown): GameSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SETTINGS, remap: {} };
  const rec = raw as Record<string, unknown>;
  return {
    masterVolume: clampInt(rec.masterVolume, DEFAULT_SETTINGS.masterVolume, 0, 100),
    sfxVolume: clampInt(rec.sfxVolume, DEFAULT_SETTINGS.sfxVolume, 0, 100),
    musicVolume: clampInt(rec.musicVolume, DEFAULT_SETTINGS.musicVolume, 0, 100),
    mute: asBool(rec.mute, false),
    dasMs: clampInt(rec.dasMs, DEFAULT_SETTINGS.dasMs, 0, 1000),
    arrMs: clampInt(rec.arrMs, DEFAULT_SETTINGS.arrMs, 0, 500),
    ghost: asBool(rec.ghost, true),
    grid: asBool(rec.grid, true),
    remap: asRemap(rec.remap),
    colorblind: asColorblind(rec.colorblind),
    reduceMotion: asBool(rec.reduceMotion, false),
  };
}

export function loadSettings(storage: SettingsStorage): GameSettings {
  try {
    const raw = storage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS, remap: {} };
    return normalizeSettings(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_SETTINGS, remap: {} };
  }
}

export function saveSettings(settings: GameSettings, storage: SettingsStorage): GameSettings {
  const next = normalizeSettings(settings);
  storage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

export function loadHowtoSeen(storage: SettingsStorage): boolean {
  try {
    return storage.getItem(HOWTO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveHowtoSeen(storage: SettingsStorage, seen = true): void {
  try {
    storage.setItem(HOWTO_SEEN_KEY, seen ? "1" : "0");
  } catch {
    // ignore
  }
}

/** Resolve a KeyboardEvent.code to a control, falling back to defaults if remap is empty/broken. */
export function resolveControl(code: string, remap: KeyRemap): ControlId | null {
  for (const id of CONTROL_IDS) {
    const bound = remap[id];
    if (typeof bound === "string" && bound.length > 0 && bound === code) {
      return id;
    }
  }
  for (const id of CONTROL_IDS) {
    const bound = remap[id];
    if (typeof bound === "string" && bound.length > 0) continue;
    if (DEFAULT_BINDINGS[id].includes(code)) return id;
  }
  return null;
}

export function displayBinding(id: ControlId, remap: KeyRemap): string {
  const bound = remap[id];
  if (typeof bound === "string" && bound.length > 0) return bound;
  return DEFAULT_BINDINGS[id][0] ?? "";
}

export function browserStorage(): SettingsStorage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}
