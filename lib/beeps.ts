let audioCtx: AudioContext | null = null;

export function ensureAudio() {
  if (audioCtx) return audioCtx;
  const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
  audioCtx = new Ctx();
  return audioCtx;
}

export async function unlockAudio() {
  const ctx = ensureAudio();
  if (ctx.state === "suspended") await ctx.resume();
}

function playTone({
  freq,
  ms,
  gain,
  type,
}: {
  freq: number;
  ms: number;
  gain: number;
  type: OscillatorType;
}) {
  const ctx = ensureAudio();

  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  const now = ctx.currentTime;
  const dur = ms / 1000;

  // Fast attack + fast decay (feels like a "clicky" beep)
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  osc.connect(g);
  g.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + dur);
}

// Countdown beep: small, clean
export function countdownBeep() {
  playTone({ freq: 880, ms: 80, gain: 0.08, type: "sine" });
}

// Transition beep: louder + sharper
export function transitionBeep() {
  playTone({ freq: 1046.5, ms: 140, gain: 0.18, type: "square" }); // C6-ish
}
