import type { GameEvent } from "../engine";
import type { SoundSlotId, ThemeId, ThemePalette } from "../theme";
import { SOUND_SLOT_IDS } from "../theme";
import { createMusicVoice, type MusicVoice } from "./music";
import { playSfxSlot } from "./sfx";

export interface AudioController {
  unlock(): void;
  setMute(mute: boolean): void;
  setMasterVolume(v: number): void;
  setSfxVolume(v: number): void;
  setMusicVolume(v: number): void;
  setTheme(id: ThemeId, palette: ThemePalette, instant?: boolean): void;
  startMusic(): void;
  stopMusic(): void;
  handleEvents(events: GameEvent[]): void;
}

function vol(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n / 100));
}

function isSlot(kind: string): kind is SoundSlotId {
  return (SOUND_SLOT_IDS as readonly string[]).includes(kind);
}

export function createAudio(): AudioController {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let sfxGain: GainNode | null = null;
  let musicGain: GainNode | null = null;
  let music: MusicVoice | null = null;
  let unlocked = false;
  let mute = false;
  let masterVol = 0.7;
  let sfxVol = 0.8;
  let musicVol = 0.55;
  let themeId: ThemeId | null = null;
  let slots: Record<string, string> = {};
  let musicWanted = false;

  function applyGains(): void {
    if (!master || !sfxGain || !musicGain) return;
    const m = mute ? 0 : 1;
    master.gain.value = masterVol * m;
    sfxGain.gain.value = sfxVol;
    musicGain.gain.value = musicVol;
  }

  function ensure(): AudioContext | null {
    const AC =
      typeof AudioContext !== "undefined"
        ? AudioContext
        : (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      sfxGain = ctx.createGain();
      musicGain = ctx.createGain();
      sfxGain.connect(master);
      musicGain.connect(master);
      master.connect(ctx.destination);
      music = createMusicVoice(ctx, musicGain);
      applyGains();
    }
    return ctx;
  }

  function unlock(): void {
    const c = ensure();
    if (!c) return;
    unlocked = true;
    if (c.state === "suspended") {
      void c.resume();
    }
    if (musicWanted && themeId && music) {
      music.start(themeId);
    }
  }

  function setMute(next: boolean): void {
    mute = next;
    applyGains();
  }

  function setMasterVolume(v: number): void {
    masterVol = vol(v);
    applyGains();
  }

  function setSfxVolume(v: number): void {
    sfxVol = vol(v);
    applyGains();
  }

  function setMusicVolume(v: number): void {
    musicVol = vol(v);
    applyGains();
  }

  function setTheme(id: ThemeId, palette: ThemePalette, instant = false): void {
    slots = palette.soundSlots;
    const changed = themeId !== null && themeId !== id;
    themeId = id;
    if (!music) return;
    if (changed) {
      music.setTheme(id, !instant);
    } else {
      music.setTheme(id, false);
    }
  }

  function startMusic(): void {
    musicWanted = true;
    if (!unlocked || !themeId || !music) return;
    music.start(themeId);
  }

  function stopMusic(): void {
    musicWanted = false;
    music?.stop();
  }

  function playSlot(slot: SoundSlotId): void {
    if (!unlocked || mute || !ctx || !sfxGain) return;
    const patchId = slots[slot] ?? slot;
    playSfxSlot(ctx, sfxGain, slot, patchId);
  }

  function handleEvents(events: GameEvent[]): void {
    if (events.length === 0) return;
    let ducked = false;
    for (const ev of events) {
      if (ev.kind === "lineClear" || ev.kind === "tetris" || ev.kind === "tSpin") {
        if (!ducked) {
          music?.duck(300);
          ducked = true;
        }
      }
      if (isSlot(ev.kind)) {
        playSlot(ev.kind);
      }
    }
  }

  return {
    unlock,
    setMute,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    setTheme,
    startMusic,
    stopMusic,
    handleEvents,
  };
}
