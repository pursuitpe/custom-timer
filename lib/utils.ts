export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function formatMMSS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

export function parseMMSS(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Accept "mm:ss" or "ss"
  if (trimmed.includes(":")) {
    const [mStr, sStr] = trimmed.split(":");
    const m = Number(mStr);
    const s = Number(sStr);
    if (!Number.isFinite(m) || !Number.isFinite(s) || m < 0 || s < 0 || s > 59) return null;
    return m * 60 + s;
  }

  const s = Number(trimmed);
  if (!Number.isFinite(s) || s < 0) return null;
  return Math.floor(s);
}
