"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { Timer } from "@/lib/types";
import { getTimerById } from "@/lib/db";
import { formatMMSS } from "@/lib/utils";

export default function RunTimerPage() {
  const params = useParams<{ id: string }>();
  const timerRef = useRef<Timer | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer once
  useEffect(() => {
    const t = getTimerById(params.id);
    if (!t) return;

    timerRef.current = t;
    setCurrentIndex(0);
    setRemaining(t.intervals[0].seconds);
  }, [params.id]);

  // Tick engine
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r === null) return r;

        if (r <= 1) {
          advanceInterval();
          return null;
        }

        return r - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  function advanceInterval() {
    const t = timerRef.current;
    if (!t) return;

    const nextIndex = currentIndex + 1;

    if (nextIndex >= t.intervals.length) {
      stop();
      return;
    }

    setCurrentIndex(nextIndex);
    setRemaining(t.intervals[nextIndex].seconds);
  }

  function start() {
    if (remaining === null) return;
    setIsRunning(true);
  }

  function pause() {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function stop() {
    pause();
    setCurrentIndex(0);
    if (timerRef.current) {
      setRemaining(timerRef.current.intervals[0].seconds);
    }
  }

  if (!timerRef.current || remaining === null) {
    return (
      <main style={{ padding: 24 }}>
        <p>Loading timer…</p>
        <Link href="/">← Back</Link>
      </main>
    );
  }

  const currentInterval = timerRef.current.intervals[currentIndex];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 24,
      }}
    >
      {/* Top */}
      <div>
        <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>
          ← Exit
        </Link>
      </div>

      {/* Big Timer */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: "20vw",
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {formatMMSS(remaining)}
        </div>

        <div style={{ fontSize: 24, marginTop: 12 }}>
          {currentInterval.title}
        </div>

        <div style={{ opacity: 0.6, marginTop: 6 }}>
          Interval {currentIndex + 1} / {timerRef.current.intervals.length}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={stop}
          style={{
            flex: 1,
            padding: 16,
            fontSize: 18,
            fontWeight: 800,
            borderRadius: 12,
            border: "none",
            background: "#374151",
            color: "white",
          }}
        >
          Restart
        </button>

        {isRunning ? (
          <button
            onClick={pause}
            style={{
              flex: 1,
              padding: 16,
              fontSize: 18,
              fontWeight: 800,
              borderRadius: 12,
              border: "none",
              background: "#ef4444",
              color: "white",
            }}
          >
            Pause
          </button>
        ) : (
          <button
            onClick={start}
            style={{
              flex: 1,
              padding: 16,
              fontSize: 18,
              fontWeight: 800,
              borderRadius: 12,
              border: "none",
              background: "#22c55e",
              color: "white",
            }}
          >
            Start
          </button>
        )}
      </div>
    </main>
  );
}
