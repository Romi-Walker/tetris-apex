import type { ThemeId } from "../theme";

export interface MusicPatch {
  rootHz: number;
  bpm: number;
  wave: OscillatorType;
  filterHz: number;
  /** Scale degrees in semitones from root. */
  intervals: readonly number[];
}

export interface SfxPatch {
  wave: OscillatorType;
  freq: number;
  noise: boolean;
}

/** Unique-enough looping beds: different root, tempo, and filter per theme. */
export const THEME_MUSIC: Record<ThemeId, MusicPatch> = {
  "neon-city": {
    rootHz: 261.63,
    bpm: 112,
    wave: "sawtooth",
    filterHz: 1400,
    intervals: [0, 3, 7, 10, 7, 3],
  },
  "deep-ocean": {
    rootHz: 82.41,
    bpm: 68,
    wave: "sine",
    filterHz: 480,
    intervals: [0, 2, 7, 9, 7, 2],
  },
  "aurora-forest": {
    rootHz: 196.0,
    bpm: 88,
    wave: "triangle",
    filterHz: 920,
    intervals: [0, 3, 7, 12, 7, 3],
  },
  "desert-night": {
    rootHz: 146.83,
    bpm: 76,
    wave: "triangle",
    filterHz: 640,
    intervals: [0, 5, 7, 10, 7, 5],
  },
  "space-station": {
    rootHz: 110.0,
    bpm: 100,
    wave: "sine",
    filterHz: 1600,
    intervals: [0, 4, 7, 11, 7, 4],
  },
  "volcanic-core": {
    rootHz: 87.31,
    bpm: 124,
    wave: "sawtooth",
    filterHz: 760,
    intervals: [0, 3, 6, 10, 6, 3],
  },
  "crystal-cave": {
    rootHz: 246.94,
    bpm: 84,
    wave: "triangle",
    filterHz: 1800,
    intervals: [0, 2, 5, 9, 12, 9],
  },
  "cyber-rain": {
    rootHz: 130.81,
    bpm: 128,
    wave: "square",
    filterHz: 1100,
    intervals: [0, 3, 7, 8, 12, 7],
  },
};

const WAVE_ALIASES: Record<string, OscillatorType> = {
  sine: "sine",
  square: "square",
  saw: "sawtooth",
  sawtooth: "sawtooth",
  triangle: "triangle",
  noise: "square",
};

const NOTE_HZ: Record<string, number> = {
  c2: 65.41,
  d2: 73.42,
  e2: 82.41,
  f2: 87.31,
  g2: 98.0,
  a2: 110.0,
  b2: 123.47,
  c3: 130.81,
  d3: 146.83,
  e3: 164.81,
  f3: 174.61,
  g3: 196.0,
  a3: 220.0,
  b3: 246.94,
  c4: 261.63,
  d4: 293.66,
  e4: 329.63,
  f4: 349.23,
  g4: 392.0,
  a4: 440.0,
  b4: 493.88,
  c5: 523.25,
  d5: 587.33,
  e5: 659.25,
  f5: 698.46,
  g5: 783.99,
  a5: 880.0,
  b5: 987.77,
  c6: 1046.5,
  d6: 1174.66,
  e6: 1318.51,
  f6: 1396.91,
  g6: 1567.98,
  a6: 1760.0,
  b6: 1975.53,
};

export function parseSfxPatch(id: string): SfxPatch {
  const [waveRaw, noteRaw] = id.split("-");
  const wave = WAVE_ALIASES[waveRaw ?? ""] ?? "square";
  const note = (noteRaw ?? "c4").toLowerCase();
  const freq = NOTE_HZ[note] ?? 440;
  return { wave, freq, noise: (waveRaw ?? "").startsWith("noise") };
}
