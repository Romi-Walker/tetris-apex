import type { SoundSlotId } from "../theme";
import { parseSfxPatch } from "./patches";

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function envGain(
  ctx: AudioContext,
  dest: AudioNode,
  now: number,
  peak: number,
  attack: number,
  dur: number,
): GainNode {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), now + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  g.connect(dest);
  return g;
}

function tone(
  ctx: AudioContext,
  dest: AudioNode,
  opts: {
    type: OscillatorType;
    freq: number;
    now: number;
    dur: number;
    peak: number;
    attack?: number;
    slide?: number;
  },
): void {
  const osc = ctx.createOscillator();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.freq, opts.now);
  if (opts.slide) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, opts.freq * opts.slide),
      opts.now + opts.dur,
    );
  }
  const g = envGain(ctx, dest, opts.now, opts.peak, opts.attack ?? 0.008, opts.dur);
  osc.connect(g);
  osc.start(opts.now);
  osc.stop(opts.now + opts.dur + 0.02);
}

function noise(
  ctx: AudioContext,
  dest: AudioNode,
  now: number,
  dur: number,
  peak: number,
  filterHz: number,
): void {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, dur + 0.04);
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = filterHz;
  filter.Q.value = 0.8;
  const g = envGain(ctx, dest, now, peak, 0.004, dur);
  src.connect(filter);
  filter.connect(g);
  src.start(now);
  src.stop(now + dur + 0.02);
}

/** Distinct short original SFX. Patch id retunes the motif; shapes stay unique. */
export function playSfxSlot(
  ctx: AudioContext,
  dest: AudioNode,
  slot: SoundSlotId,
  patchId: string,
): void {
  const now = ctx.currentTime;
  const patch = parseSfxPatch(patchId);
  const f = patch.freq;
  const w = patch.wave;

  switch (slot) {
    case "move":
      tone(ctx, dest, { type: w, freq: f, now, dur: 0.045, peak: 0.11, attack: 0.002 });
      break;
    case "rotate":
      tone(ctx, dest, { type: w, freq: f, now, dur: 0.07, peak: 0.13, attack: 0.004, slide: 1.25 });
      break;
    case "lock":
      tone(ctx, dest, { type: w, freq: f, now, dur: 0.11, peak: 0.18, attack: 0.004, slide: 0.55 });
      noise(ctx, dest, now, 0.06, 0.08, 420);
      break;
    case "hardDrop":
      noise(ctx, dest, now, 0.09, 0.2, 280);
      tone(ctx, dest, { type: "square", freq: f, now, dur: 0.12, peak: 0.16, slide: 0.4 });
      break;
    case "lineClear":
      tone(ctx, dest, { type: w, freq: f, now, dur: 0.12, peak: 0.16 });
      tone(ctx, dest, { type: w, freq: f * 1.25, now: now + 0.05, dur: 0.12, peak: 0.14 });
      tone(ctx, dest, { type: w, freq: f * 1.5, now: now + 0.1, dur: 0.14, peak: 0.12 });
      break;
    case "tetris":
      tone(ctx, dest, { type: "sawtooth", freq: f, now, dur: 0.16, peak: 0.18 });
      tone(ctx, dest, { type: "sawtooth", freq: f * 1.25, now: now + 0.07, dur: 0.16, peak: 0.16 });
      tone(ctx, dest, { type: "sawtooth", freq: f * 1.5, now: now + 0.14, dur: 0.18, peak: 0.16 });
      tone(ctx, dest, { type: "triangle", freq: f * 2, now: now + 0.22, dur: 0.22, peak: 0.14 });
      break;
    case "tSpin":
      tone(ctx, dest, { type: "sine", freq: f, now, dur: 0.14, peak: 0.16, slide: 1.8 });
      tone(ctx, dest, { type: "triangle", freq: f * 1.5, now: now + 0.05, dur: 0.16, peak: 0.12, slide: 0.7 });
      break;
    case "hold":
      tone(ctx, dest, { type: w, freq: f * 1.4, now, dur: 0.1, peak: 0.12, slide: 0.65 });
      tone(ctx, dest, { type: w, freq: f, now: now + 0.04, dur: 0.12, peak: 0.1 });
      break;
    case "levelUp":
      tone(ctx, dest, { type: "triangle", freq: f * 0.75, now, dur: 0.1, peak: 0.14 });
      tone(ctx, dest, { type: "triangle", freq: f, now: now + 0.08, dur: 0.12, peak: 0.14 });
      tone(ctx, dest, { type: "triangle", freq: f * 1.5, now: now + 0.16, dur: 0.18, peak: 0.16 });
      break;
    case "gameOver":
      tone(ctx, dest, { type: "sawtooth", freq: f * 2, now, dur: 0.22, peak: 0.18, slide: 0.5 });
      tone(ctx, dest, { type: "square", freq: f, now: now + 0.16, dur: 0.32, peak: 0.16, slide: 0.45 });
      noise(ctx, dest, now + 0.1, 0.2, 0.08, 180);
      break;
  }
}
