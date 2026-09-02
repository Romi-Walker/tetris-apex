import type { ThemeId } from "../theme";
import { THEME_MUSIC, type MusicPatch } from "./patches";

export interface MusicVoice {
  start(theme: ThemeId): void;
  setTheme(theme: ThemeId, crossfade: boolean): void;
  stop(): void;
  duck(ms?: number): void;
}

function midiRatio(semitones: number): number {
  return 2 ** (semitones / 12);
}

export function createMusicVoice(
  ctx: AudioContext,
  dest: AudioNode,
): MusicVoice {
  const duckGain = ctx.createGain();
  duckGain.gain.value = 1;
  duckGain.connect(dest);

  let filterA = ctx.createBiquadFilter();
  let filterB = ctx.createBiquadFilter();
  const mixA = ctx.createGain();
  const mixB = ctx.createGain();
  mixA.gain.value = 1;
  mixB.gain.value = 0;
  filterA.type = "lowpass";
  filterB.type = "lowpass";
  filterA.connect(mixA);
  filterB.connect(mixB);
  mixA.connect(duckGain);
  mixB.connect(duckGain);

  let active: "a" | "b" = "a";
  let patch: MusicPatch = THEME_MUSIC["neon-city"];
  let themeId: ThemeId = "neon-city";
  let playing = false;
  let nextTime = 0;
  let step = 0;
  let timer: number | null = null;

  function currentFilter(): BiquadFilterNode {
    return active === "a" ? filterA : filterB;
  }

  function applyPatch(target: BiquadFilterNode, p: MusicPatch, now: number): void {
    target.frequency.cancelScheduledValues(now);
    target.frequency.setTargetAtTime(p.filterHz, now, 0.08);
    target.Q.value = 0.7;
  }

  function scheduleNote(time: number, index: number): void {
    const interval = patch.intervals[index % patch.intervals.length] ?? 0;
    const bass = patch.rootHz * midiRatio(interval);
    const fifth = bass * midiRatio(7);
    const osc = ctx.createOscillator();
    osc.type = patch.wave;
    osc.frequency.setValueAtTime(index % 3 === 0 ? bass : bass * 2, time);
    const g = ctx.createGain();
    const peak = index % 6 === 0 ? 0.08 : 0.045;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(peak, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);
    osc.connect(g);
    g.connect(currentFilter());
    osc.start(time);
    osc.stop(time + 0.32);

    if (index % 2 === 0) {
      const pad = ctx.createOscillator();
      pad.type = patch.wave === "sawtooth" ? "triangle" : "sine";
      pad.frequency.setValueAtTime(fifth / 2, time);
      const pg = ctx.createGain();
      pg.gain.setValueAtTime(0.0001, time);
      pg.gain.exponentialRampToValueAtTime(0.03, time + 0.04);
      pg.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);
      pad.connect(pg);
      pg.connect(currentFilter());
      pad.start(time);
      pad.stop(time + 0.42);
    }
  }

  function beatSec(): number {
    return 60 / Math.max(40, patch.bpm);
  }

  function tick(): void {
    if (!playing) return;
    const horizon = ctx.currentTime + 0.2;
    while (nextTime < horizon) {
      scheduleNote(nextTime, step);
      step += 1;
      nextTime += beatSec();
    }
    timer = window.setTimeout(tick, 40);
  }

  function start(theme: ThemeId): void {
    themeId = theme;
    patch = THEME_MUSIC[theme];
    applyPatch(currentFilter(), patch, ctx.currentTime);
    if (playing) return;
    playing = true;
    nextTime = ctx.currentTime + 0.05;
    step = 0;
    tick();
  }

  function setTheme(theme: ThemeId, crossfade: boolean): void {
    if (theme === themeId && playing) {
      patch = THEME_MUSIC[theme];
      applyPatch(currentFilter(), patch, ctx.currentTime);
      return;
    }
    themeId = theme;
    patch = THEME_MUSIC[theme];
    const now = ctx.currentTime;
    if (!playing) {
      applyPatch(currentFilter(), patch, now);
      return;
    }
    if (!crossfade) {
      applyPatch(currentFilter(), patch, now);
      return;
    }
    const next = active === "a" ? mixB : mixA;
    const prev = active === "a" ? mixA : mixB;
    const nextFilter = active === "a" ? filterB : filterA;
    applyPatch(nextFilter, patch, now);
    prev.gain.cancelScheduledValues(now);
    next.gain.cancelScheduledValues(now);
    prev.gain.setValueAtTime(prev.gain.value, now);
    next.gain.setValueAtTime(next.gain.value, now);
    prev.gain.linearRampToValueAtTime(0, now + 0.35);
    next.gain.linearRampToValueAtTime(1, now + 0.35);
    active = active === "a" ? "b" : "a";
  }

  function stop(): void {
    playing = false;
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  function duck(ms = 300): void {
    const now = ctx.currentTime;
    const dur = Math.max(0.08, ms / 1000);
    const g = duckGain.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0.28, now + 0.04);
    g.linearRampToValueAtTime(1, now + dur);
  }

  return { start, setTheme, stop, duck };
}
