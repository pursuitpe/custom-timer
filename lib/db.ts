import { Timer } from "@/lib/types";

const KEY = "custom_timer_v1";

function readAll(): Timer[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Timer[];
  } catch {
    return [];
  }
}

function writeAll(timers: Timer[]) {
  localStorage.setItem(KEY, JSON.stringify(timers));
}

export function getAllTimers(): Timer[] {
  return readAll();
}

export function getTimerById(id: string): Timer | null {
  return readAll().find((t) => t.id === id) ?? null;
}

export function saveTimer(timer: Timer) {
  const timers = readAll();
  const idx = timers.findIndex((t) => t.id === timer.id);

  if (idx >= 0) timers[idx] = timer;
  else timers.push(timer);

  writeAll(timers);
}

export function deleteTimer(id: string) {
  const timers = readAll().filter((t) => t.id !== id);
  writeAll(timers);
}
