export type IntervalColor = "gray" | "green" | "yellow" | "red" | "blue";

export type Interval = {
  id: string;
  title: string;
  seconds: number;
  color: IntervalColor;
};

export type CountdownSetting = "none" | "3" | "5" | "10";

export type TimerSettings = {
  allowOverrun: boolean;
  soundEnabled: boolean;
  countdownBeep: CountdownSetting; // NEW
};

export type Timer = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  settings: TimerSettings;
  intervals: Interval[];
};

export const defaultTimerSettings: TimerSettings = {
  allowOverrun: false,
  soundEnabled: true,
  countdownBeep: "3", // default (matches what you liked)
};
