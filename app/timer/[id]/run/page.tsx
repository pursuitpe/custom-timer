"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getTimerById } from "@/lib/db";
import { Timer, defaultTimerSettings } from "@/lib/types";
import { formatMMSS } from "@/lib/utils";
import { unlockAudio, countdownBeep, transitionBeep } from "@/lib/beeps";

type RunState = {
  isRunning: boolean;
  currentIndex: number;
  remainingSec: number;
  elapsedTotalSec: number;
};

const tileBgByColor: Record<string, string> = {
  gray: "#374151",
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
  blue: "#3b82f6",
};

const screenBgByColor: Record<string, string> = {
  gray: "#111827",
  green: "#16a34a",
  yellow: "#ca8a04",
  red: "#dc2626",
  blue: "#2563eb",
};

export default function RunTimerPage() {
  const params = useParams<{ id: string }>();

  const [mounted, setMounted] = useState(false);
  const [timer, setTimer] = useState<Timer | null>(null);
  const [state, setState] = useState<RunState | null>(null);

  const tickRef = useRef<NodeJS.Timeout | null>(null);

  const lastRemainingRef = useRef<number | null>(null);
  const lastIndexRef = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const raw = getTimerById(params.id);

    if (!raw) {
      setTimer(null);
      setState(null);
      return;
    }

    // Backfill settings for older timers
    const t: Timer = { ...raw, settings: { ...defaultTimerSettings, ...raw.settings } };
    setTimer(t);

    if (t.intervals.length > 0) {
      setState({
        isRunning: false,
        currentIndex: 0,
        remainingSec: t.intervals[0].seconds,
        elapsedTotalSec: 0,
      });
      lastRemainingRef.current = t.intervals[0].seconds;
      lastIndexRef.current = 0;
    } else {
      setState(null);
    }
  }, [mounted, params.id]);

  useEffect(() => {
    if (!timer || !state) return;

    if (!state.isRunning) {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }

    tickRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev) return prev;

        const nextElapsed = prev.elapsedTotalSec + 1;

        if (prev.remainingSec <= 1) {
          const nextIndex = prev.currentIndex + 1;

          if (nextIndex >= timer.intervals.length) {
            return {
              ...prev,
              isRunning: false,
              remainingSec: 0,
              elapsedTotalSec: nextElapsed,
            };
          }

          return {
            ...prev,
            currentIndex: nextIndex,
            remainingSec: timer.intervals[nextIndex].seconds,
            elapsedTotalSec: nextElapsed,
          };
        }

        return {
          ...prev,
          remainingSec: prev.remainingSec - 1,
          elapsedTotalSec: nextElapsed,
        };
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [state?.isRunning, timer]);

  // Beeps: countdown + transition
  useEffect(() => {
    if (!timer || !state) return;
    if (!state.isRunning) return;
    if (!timer.settings.soundEnabled) return;

    const lastRem = lastRemainingRef.current;
    const lastIdx = lastIndexRef.current;

    // Countdown threshold based on setting
    const setting = timer.settings.countdownBeep; // "none" | "3" | "5" | "10"
    const thresholds =
      setting === "10"
        ? [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
        : setting === "5"
        ? [5, 4, 3, 2, 1]
        : setting === "3"
        ? [3, 2, 1]
        : [];

    if (lastRem !== state.remainingSec) {
      if (thresholds.includes(state.remainingSec)) {
        countdownBeep();
      }
    }

    if (lastIdx !== null && lastIdx !== state.currentIndex) {
      transitionBeep();
    }

    lastRemainingRef.current = state.remainingSec;
    lastIndexRef.current = state.currentIndex;
  }, [state, timer]);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, []);

  if (!mounted) {
    return (
      <main style={{ padding: 24 }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!timer) {
    return (
      <main style={{ padding: 24 }}>
        <p>Timer not found.</p>
        <Link href="/">← Back</Link>
      </main>
    );
  }

  if (!state) {
    return (
      <main style={{ padding: 24 }}>
        <p>Loading...</p>
        <Link href="/">← Back</Link>
      </main>
    );
  }

  const totalSec = timer.intervals.reduce((sum, i) => sum + i.seconds, 0);
  const remainingTotalSec = Math.max(0, totalSec - state.elapsedTotalSec);

  const current = timer.intervals[state.currentIndex];
  const prev = state.currentIndex > 0 ? timer.intervals[state.currentIndex - 1] : null;
  const next =
    state.currentIndex < timer.intervals.length - 1
      ? timer.intervals[state.currentIndex + 1]
      : null;

  const currentTileBg = tileBgByColor[current.color] ?? "#374151";
  const nextTileBg = next ? (tileBgByColor[next.color] ?? "#374151") : "#111";

  const screenBg = state.isRunning
    ? screenBgByColor[current.color] ?? "#111827"
    : "#111";

  async function startPause() {
    if (!state.isRunning && timer.settings.soundEnabled) {
      await unlockAudio();
    }
    setState((s) => (s ? { ...s, isRunning: !s.isRunning } : s));
  }

  function restart() {
    setState({
      isRunning: false,
      currentIndex: 0,
      remainingSec: timer.intervals[0].seconds,
      elapsedTotalSec: 0,
    });
    lastRemainingRef.current = timer.intervals[0].seconds;
    lastIndexRef.current = 0;
  }

  function skipForward() {
    setState((s) => {
      if (!s) return s;
      const nextIndex = Math.min(timer.intervals.length - 1, s.currentIndex + 1);
      lastRemainingRef.current = timer.intervals[nextIndex].seconds;
      lastIndexRef.current = nextIndex;
      return { ...s, currentIndex: nextIndex, remainingSec: timer.intervals[nextIndex].seconds };
    });
  }

  function skipBack() {
    setState((s) => {
      if (!s) return s;
      const prevIndex = Math.max(0, s.currentIndex - 1);
      lastRemainingRef.current = timer.intervals[prevIndex].seconds;
      lastIndexRef.current = prevIndex;
      return { ...s, currentIndex: prevIndex, remainingSec: timer.intervals[prevIndex].seconds };
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: screenBg,
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "background 200ms ease",
      }}
    >
      <div style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ color: "white", textDecoration: "none", opacity: 0.85 }}>
          ← Exit
        </Link>
        <div style={{ fontWeight: 900, opacity: 0.95 }}>{timer.name}</div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: 18, textAlign: "center" }}>
        <div style={{ fontSize: "20vw", fontWeight: 900, lineHeight: 1 }}>
          {formatMMSS(state.remainingSec)}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 14, opacity: 0.85 }}>ELAPSED</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{formatMMSS(state.elapsedTotalSec)}</div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, opacity: 0.85 }}>INTERVALS</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>
              {state.currentIndex + 1} / {timer.intervals.length}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, opacity: 0.85 }}>REMAINING</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{formatMMSS(remainingTotalSec)}</div>
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "2px solid rgba(255,255,255,0.18)",
          display: "grid",
          gridTemplateColumns: "110px 1fr 1fr 1fr 110px",
          height: 140,
        }}
      >
        <button
          onClick={restart}
          style={{
            border: "none",
            background: "#1f2937",
            color: "white",
            fontWeight: 900,
            fontSize: 22,
            cursor: "pointer",
          }}
          title="Restart"
        >
          ↻
        </button>

        <button
          onClick={prev ? skipBack : undefined}
          disabled={!prev}
          style={{
            border: "none",
            background: "#111",
            color: "white",
            fontSize: 34,
            fontWeight: 500,
            opacity: prev ? 1 : 0.35,
            cursor: prev ? "pointer" : "default",
            padding: "0 18px",
            textAlign: "left",
            borderLeft: "2px solid rgba(255,255,255,0.18)",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {prev ? prev.title : "—"}
        </button>

        <div
          style={{
            borderLeft: "2px solid rgba(255,255,255,0.18)",
            background: currentTileBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 18px",
            fontSize: 40,
            fontWeight: 500,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
          title={current.title}
        >
          {current.title}
        </div>

        <button
          onClick={next ? skipForward : undefined}
          disabled={!next}
          style={{
            border: "none",
            background: next ? nextTileBg : "#111",
            color: "white",
            fontSize: 34,
            fontWeight: 500,
            opacity: next ? 1 : 0.35,
            cursor: next ? "pointer" : "default",
            padding: "0 18px",
            textAlign: "center",
            borderLeft: "2px solid rgba(255,255,255,0.18)",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {next ? next.title : "—"}
        </button>

        <button
          onClick={startPause}
          style={{
            border: "none",
            background: "#111",
            color: "white",
            fontWeight: 900,
            fontSize: 26,
            cursor: "pointer",
            borderLeft: "2px solid rgba(255,255,255,0.18)",
          }}
          title={state.isRunning ? "Pause" : "Start"}
        >
          {state.isRunning ? "❚❚" : "▶"}
        </button>
      </div>
    </main>
  );
}
