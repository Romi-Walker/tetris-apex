export const THEME_IDS = [
  "neon-city",
  "deep-ocean",
  "aurora-forest",
  "desert-night",
  "space-station",
  "volcanic-core",
  "crystal-cave",
  "cyber-rain",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const THEME_NAMES: Record<ThemeId, string> = {
  "neon-city": "Neon City",
  "deep-ocean": "Deep Ocean",
  "aurora-forest": "Aurora Forest",
  "desert-night": "Desert Night",
  "space-station": "Space Station",
  "volcanic-core": "Volcanic Core",
  "crystal-cave": "Crystal Cave",
  "cyber-rain": "Cyber Rain",
};

export const SOUND_SLOT_IDS = [
  "lock",
  "lineClear",
  "tetris",
  "move",
  "rotate",
  "hardDrop",
  "hold",
  "gameOver",
  "levelUp",
  "tSpin",
] as const;

export type SoundSlotId = (typeof SOUND_SLOT_IDS)[number];

/** Synth patch ids (waveform/scale). No sample files. */
export const DEFAULT_SOUND_SLOTS: Record<SoundSlotId, string> = {
  lock: "square-g2",
  lineClear: "triangle-c4",
  tetris: "saw-c5",
  move: "square-c6",
  rotate: "square-e6",
  hardDrop: "noise-g2",
  hold: "sine-a4",
  gameOver: "saw-c3",
  levelUp: "triangle-g5",
  tSpin: "sine-d5",
};

/** @deprecated alias — slots are synth patch ids, never files. */
export const EMPTY_SOUND_SLOTS = DEFAULT_SOUND_SLOTS;

export function soundSlotsFor(id: ThemeId): Record<string, string> {
  const music = `music:${id}`;
  switch (id) {
    case "neon-city":
      return {
        ...DEFAULT_SOUND_SLOTS,
        lock: "saw-c3",
        move: "square-g5",
        rotate: "square-b5",
        music,
      };
    case "deep-ocean":
      return {
        ...DEFAULT_SOUND_SLOTS,
        lock: "sine-e2",
        move: "sine-b4",
        rotate: "sine-d5",
        music,
      };
    case "aurora-forest":
      return {
        ...DEFAULT_SOUND_SLOTS,
        lock: "triangle-g2",
        move: "triangle-e5",
        rotate: "triangle-a5",
        music,
      };
    case "desert-night":
      return {
        ...DEFAULT_SOUND_SLOTS,
        lock: "square-d2",
        move: "triangle-f5",
        rotate: "triangle-a5",
        music,
      };
    case "space-station":
      return {
        ...DEFAULT_SOUND_SLOTS,
        lock: "sine-a2",
        move: "square-c6",
        rotate: "square-e6",
        music,
      };
    case "volcanic-core":
      return {
        ...DEFAULT_SOUND_SLOTS,
        lock: "saw-f2",
        move: "square-c5",
        rotate: "saw-e5",
        music,
      };
    case "crystal-cave":
      return {
        ...DEFAULT_SOUND_SLOTS,
        lock: "triangle-b2",
        move: "sine-f6",
        rotate: "sine-a6",
        music,
      };
    case "cyber-rain":
      return {
        ...DEFAULT_SOUND_SLOTS,
        lock: "square-c2",
        move: "square-g6",
        rotate: "square-b6",
        music,
      };
  }
}

export const PIECES_WITHOUT_LEVELUP = 40;
export const LEVEL_UP_SWITCH_CHANCE = 0.7;
export const FADE_MIN_MS = 800;
export const FADE_MAX_MS = 1200;
