"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getTimerById } from "@/lib/db";
import { Timer, defaultTimerSettings } from "@/lib/types";
import { formatMMSS } from "@/lib/utils";
import { getColorById } from "@/lib/colors";
import { unlockAudio, countdownBeep, transitionBeep } from "@/lib/beeps";

type RunState = {
  isRunning: boolean;
  currentIndex: number;
  remainingSec: number;
  elapsedTotalSec: number;
};

export default function RunTimerPage() {
  const params = useParams<{ id: string }>();

  const [mounted, setMounted] = useState(false);
  const [timer, setTimer] = useState<Timer | null>(null);
  const [state, setState] = useState<RunState | null>(null);

  const tickRef = useRef<NodeJS.Timeout | null>(null);

  // For beeps (avoid double-firing)
  const lastRemainingRef = useRef<number | null>(null);
  const lastIndexRef = useRef<number | null>(null);

  // Hydration fix
  useEffect(() => setMounted(true), []);

  // Load timer after mount (localStorage safe)
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

  // Tick engine
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

        // Interval ends -> advance
        if (prev.remainingSec <= 1) {
          const nextIndex = prev.currentIndex + 1;

          // End of timer
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

        // Normal tick
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

    // Countdown thresholds based on setting
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

    // Interval transition beep (louder/sharper)
    if (lastIdx !== null && lastIdx !== state.currentIndex) {
      transitionBeep();
    }

    lastRemainingRef.current = state.remainingSec;
    lastIndexRef.current = state.currentIndex;
  }, [state, timer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, []);

  // ---- Render guards ----
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

  // ---- Derived UI ----
  const totalSec = timer.intervals.reduce((sum, i) => sum + i.seconds, 0);
  const remainingTotalSec = Math.max(0, totalSec - state.elapsedTotalSec);

  const currentInterval = timer.intervals[state.currentIndex];
  const prevInterval = state.currentIndex > 0 ? timer.intervals[state.currentIndex - 1] : null;
  const nextInterval =
    state.currentIndex < timer.intervals.length - 1 ? timer.intervals[state.currentIndex + 1] : null;

  // Colors from your palette
  const currentColor = getColorById(currentInterval.color);
  const prevColor = prevInterval ? getColorById(prevInterval.color) : null;
  const nextColor = nextInterval ? getColorById(nextInterval.color) : null;

  // Big background only while running (like Seconds Pro)
  const screenBg = state.isRunning ? currentColor.bg : "#111";
  const screenText = state.isRunning ? currentColor.text : "#FFFFFF";

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
      return {
        ...s,
        currentIndex: nextIndex,
        remainingSec: timer.intervals[nextIndex].seconds,
      };
    });
  }

  function skipBack() {
    setState((s) => {
      if (!s) return s;
      const prevIndex = Math.max(0, s.currentIndex - 1);
      lastRemainingRef.current = timer.intervals[prevIndex].seconds;
      lastIndexRef.current = prevIndex;
      return {
        ...s,
        currentIndex: prevIndex,
        remainingSec: timer.intervals[prevIndex].seconds,
      };
    });
  }

  // A subtle border color that works on both light/dark screenText
  const divider = state.isRunning
    ? screenText === "#000000"
      ? "rgba(0,0,0,0.25)"
      : "rgba(255,255,255,0.25)"
    : "rgba(255,255,255,0.18)";

  const controlBg = state.isRunning
    ? screenText === "#000000"
      ? "rgba(0,0,0,0.18)"
      : "rgba(255,255,255,0.18)"
    : "#1f2937";

  const controlText = state.isRunning ? screenText : "#FFFFFF";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: screenBg,
        color: screenText,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "background 200ms ease, color 200ms ease",
      }}
    >
      {/* Top bar */}
      <div style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ color: screenText, textDecoration: "none", opacity: 0.9 }}>
          ← Exit
        </Link>
        <div style={{ fontWeight: 900, opacity: 0.95 }}>{timer.name}</div>
        <div style={{ width: 40 }} />
      </div>

      {/* Big time + stats */}
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

      {/* Bottom tiles: Restart | Prev | Current | Next | Play/Pause */}
      <div
        style={{
          borderTop: `2px solid ${divider}`,
          display: "grid",
          gridTemplateColumns: "110px 1fr 1fr 1fr 110px",
          height: 140,
        }}
      >
        {/* Restart */}
        <button
          onClick={restart}
          style={{
            border: "none",
            background: controlBg,
            color: controlText,
            fontWeight: 900,
            fontSize: 22,
            cursor: "pointer",
          }}
          title="Restart"
        >
          ↻
        </button>

        {/* Prev tile */}
        <button
          onClick={prevInterval ? skipBack : undefined}
          disabled={!prevInterval}
          style={{
            border: "none",
            background: prevColor ? prevColor.bg : "transparent",
            color: prevColor ? prevColor.text : controlText,
            fontSize: 34,
            fontWeight: 500,
            opacity: prevInterval ? 1 : 0.35,
            cursor: prevInterval ? "pointer" : "default",
            padding: "0 18px",
            textAlign: "left",
            borderLeft: `2px solid ${divider}`,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
          title={prevInterval ? "Previous interval" : undefined}
        >
          {prevInterval ? prevInterval.title : "—"}
        </button>

        {/* Current tile (colored) */}
        <div
          style={{
            borderLeft: `2px solid ${divider}`,
            background: currentColor.bg,
            color: currentColor.text,
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
          title={currentInterval.title}
        >
          {currentInterval.title}
        </div>

        {/* Next tile */}
        <button
          onClick={nextInterval ? skipForward : undefined}
          disabled={!nextInterval}
          style={{
            border: "none",
            background: nextColor ? nextColor.bg : "transparent",
            color: nextColor ? nextColor.text : controlText,
            fontSize: 34,
            fontWeight: 500,
            opacity: nextInterval ? 1 : 0.35,
            cursor: nextInterval ? "pointer" : "default",
            padding: "0 18px",
            textAlign: "center",
            borderLeft: `2px solid ${divider}`,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
          title={nextInterval ? "Next interval (tap to skip)" : undefined}
        >
          {nextInterval ? nextInterval.title : "—"}
        </button>

        {/* Start/Pause */}
        <button
          onClick={startPause}
          style={{
            border: "none",
            background: controlBg,
            color: controlText,
            fontWeight: 900,
            fontSize: 26,
            cursor: "pointer",
            borderLeft: `2px solid ${divider}`,
          }}
          title={state.isRunning ? "Pause" : "Start"}
        >
          {state.isRunning ? "❚❚" : "▶"}
        </button>
      </div>
    </main>
  );
}
