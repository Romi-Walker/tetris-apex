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
] as const;

export type SoundSlotId = (typeof SOUND_SLOT_IDS)[number];

export const EMPTY_SOUND_SLOTS: Record<SoundSlotId, string> = {
  lock: "",
  lineClear: "",
  tetris: "",
  move: "",
  rotate: "",
  hardDrop: "",
  hold: "",
  gameOver: "",
  levelUp: "",
};

export const PIECES_WITHOUT_LEVELUP = 40;
export const LEVEL_UP_SWITCH_CHANCE = 0.7;
export const FADE_MIN_MS = 800;
export const FADE_MAX_MS = 1200;
