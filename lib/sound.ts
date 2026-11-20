/**
 * Tiny opt-in sound effects (CLAUDE.md §2/§8): synthesised with WebAudio, so there are no
 * audio files to download and nothing ever plays until the visitor turns sound on.
 */
import { useAppStore } from "./store";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined" || !useAppStore.getState().soundOn) return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, gain = 0.08, slideTo?: number) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(dur: number, gain = 0.06, highpass = 800) {
  const a = audio();
  if (!a) return;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = highpass;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(a.destination);
  src.start();
}

export const sfx = {
  /** Soft tactile click for buttons. */
  click: () => tone(660, 0.06, "triangle", 0.05),
  /** Canopy opening: a whump + flutter. */
  canopy: () => {
    tone(140, 0.35, "sine", 0.14, 60);
    noise(0.4, 0.05, 400);
  },
  /** Easter egg found: two-note chime. */
  found: () => {
    tone(880, 0.12, "sine", 0.06);
    window.setTimeout(() => tone(1320, 0.18, "sine", 0.05), 90);
  },
  /** Pigeon. */
  coo: () => tone(420, 0.25, "sine", 0.07, 300),
  /** Camera shutter. */
  shutter: () => noise(0.08, 0.08, 2000),
};
