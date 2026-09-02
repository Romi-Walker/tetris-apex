import {
  CONTROL_IDS,
  displayBinding,
  loadSettings,
  saveSettings,
  type ControlId,
  type GameSettings,
  type SettingsStorage,
} from "./settings";
import type { ColorblindMode } from "../theme";

export function bindSettingsForm(
  root: HTMLElement,
  storage: SettingsStorage,
  handlers: {
    onChange(settings: GameSettings): void;
    onFullscreen?: () => void;
  },
): {
  get(): GameSettings;
  setCapturing(on: boolean): void;
  capturing(): boolean;
  refresh(): void;
} {
  let settings = loadSettings(storage);
  let captureId: ControlId | null = null;

  const master = root.querySelector<HTMLInputElement>("#set-master");
  const sfx = root.querySelector<HTMLInputElement>("#set-sfx");
  const music = root.querySelector<HTMLInputElement>("#set-music");
  const mute = root.querySelector<HTMLInputElement>("#set-mute");
  const das = root.querySelector<HTMLInputElement>("#set-das");
  const arr = root.querySelector<HTMLInputElement>("#set-arr");
  const ghost = root.querySelector<HTMLInputElement>("#set-ghost");
  const grid = root.querySelector<HTMLInputElement>("#set-grid");
  const colorblind = root.querySelector<HTMLSelectElement>("#set-colorblind");
  const reduce = root.querySelector<HTMLInputElement>("#set-reduce");
  const remapRoot = root.querySelector<HTMLElement>("#set-remap");

  function persist(partial: Partial<GameSettings>): void {
    settings = saveSettings({ ...settings, ...partial }, storage);
    handlers.onChange(settings);
    paint();
  }

  function paint(): void {
    if (master) master.value = String(settings.masterVolume);
    if (sfx) sfx.value = String(settings.sfxVolume);
    if (music) music.value = String(settings.musicVolume);
    if (mute) mute.checked = settings.mute;
    if (das) das.value = String(settings.dasMs);
    if (arr) arr.value = String(settings.arrMs);
    if (ghost) ghost.checked = settings.ghost;
    if (grid) grid.checked = settings.grid;
    if (colorblind) colorblind.value = settings.colorblind;
    if (reduce) reduce.checked = settings.reduceMotion;
    if (remapRoot) {
      for (const id of CONTROL_IDS) {
        const btn = remapRoot.querySelector<HTMLButtonElement>(`[data-remap="${id}"]`);
        if (!btn) continue;
        const armed = captureId === id;
        btn.textContent = armed ? "Taste…" : displayBinding(id, settings.remap);
        btn.classList.toggle("remap-armed", armed);
      }
    }
  }

  master?.addEventListener("input", () => persist({ masterVolume: Number(master.value) }));
  sfx?.addEventListener("input", () => persist({ sfxVolume: Number(sfx.value) }));
  music?.addEventListener("input", () => persist({ musicVolume: Number(music.value) }));
  mute?.addEventListener("change", () => persist({ mute: mute.checked }));
  das?.addEventListener("change", () => persist({ dasMs: Number(das.value) }));
  arr?.addEventListener("change", () => persist({ arrMs: Number(arr.value) }));
  ghost?.addEventListener("change", () => persist({ ghost: ghost.checked }));
  grid?.addEventListener("change", () => persist({ grid: grid.checked }));
  colorblind?.addEventListener("change", () => {
    persist({ colorblind: colorblind.value as ColorblindMode });
  });
  reduce?.addEventListener("change", () => persist({ reduceMotion: reduce.checked }));

  root.querySelector("#btn-fullscreen")?.addEventListener("click", () => {
    handlers.onFullscreen?.();
  });
  root.querySelector("#btn-fullscreen-hud")?.addEventListener("click", () => {
    handlers.onFullscreen?.();
  });

  remapRoot?.addEventListener("click", (event) => {
    const btn = (event.target as HTMLElement | null)?.closest?.("button[data-remap]");
    if (!(btn instanceof HTMLButtonElement)) return;
    const id = btn.dataset.remap as ControlId | undefined;
    if (!id) return;
    captureId = captureId === id ? null : id;
    paint();
  });

  window.addEventListener("keydown", (event) => {
    if (!captureId) return;
    event.preventDefault();
    event.stopPropagation();
    const id = captureId;
    captureId = null;
    persist({ remap: { ...settings.remap, [id]: event.code } });
  }, true);

  paint();
  handlers.onChange(settings);

  return {
    get: () => settings,
    setCapturing: (on) => {
      if (!on) {
        captureId = null;
        paint();
      }
    },
    capturing: () => captureId !== null,
    refresh: () => {
      settings = loadSettings(storage);
      paint();
    },
  };
}

