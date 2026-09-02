import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  loadSettings,
  resolveControl,
  saveSettings,
  type GameSettings,
  type SettingsStorage,
} from "../src/ui/settings";

function memStore(initial: Record<string, string> = {}): SettingsStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key)! : null),
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe("settings load/save", () => {
  it("round-trips mute, volumes, das, colorblind, remap with injected storage", () => {
    const storage = memStore();
    const input: GameSettings = {
      ...DEFAULT_SETTINGS,
      mute: true,
      masterVolume: 40,
      sfxVolume: 10,
      musicVolume: 80,
      dasMs: 200,
      arrMs: 16,
      colorblind: "deuteranopia",
      remap: { left: "KeyJ", pause: "KeyP" },
      ghost: false,
      grid: false,
      reduceMotion: true,
    };
    const saved = saveSettings(input, storage);
    expect(storage.getItem(SETTINGS_KEY)).toBeTruthy();
    const loaded = loadSettings(storage);
    expect(loaded.mute).toBe(true);
    expect(loaded.masterVolume).toBe(40);
    expect(loaded.sfxVolume).toBe(10);
    expect(loaded.musicVolume).toBe(80);
    expect(loaded.dasMs).toBe(200);
    expect(loaded.arrMs).toBe(16);
    expect(loaded.colorblind).toBe("deuteranopia");
    expect(loaded.remap.left).toBe("KeyJ");
    expect(loaded.remap.pause).toBe("KeyP");
    expect(loaded.ghost).toBe(false);
    expect(loaded.grid).toBe(false);
    expect(loaded.reduceMotion).toBe(true);
    expect(saved.mute).toBe(true);
  });

  it("falls back to defaults when remap is empty or broken", () => {
    const storage = memStore({ [SETTINGS_KEY]: "{\"remap\":{\"left\":\"\"}}" });
    const loaded = loadSettings(storage);
    expect(resolveControl("ArrowLeft", loaded.remap)).toBe("left");
    expect(resolveControl("Space", loaded.remap)).toBe("hard");
    expect(resolveControl("KeyX", loaded.remap)).toBe("cw");
    expect(resolveControl("Escape", loaded.remap)).toBe("pause");
  });
});

describe("settings broken JSON", () => {
  it("loadSettings with invalid JSON, null, and array returns DEFAULT_SETTINGS", () => {
    for (const raw of ["{not json", "null", "[]"]) {
      const storage = memStore({ [SETTINGS_KEY]: raw });
      const loaded = loadSettings(storage);
      expect(loaded).toEqual({ ...DEFAULT_SETTINGS, remap: {} });
    }
  });
});
