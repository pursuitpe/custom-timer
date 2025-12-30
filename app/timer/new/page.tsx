"use client";

import Link from "next/link";
import { useMemo } from "react";
import { uid, formatMMSS } from "@/lib/utils";
import { Timer, defaultTimerSettings } from "@/lib/types";

export default function NewTimerPage() {
  const timer: Timer = useMemo(() => {
    const now = new Date().toISOString();

    return {
      id: uid("timer"),
      name: "[30] D1",
      createdAt: now,
      updatedAt: now,
      settings: { ...defaultTimerSettings },
      intervals: [
        { id: uid("int"), title: "A - Set Up & WU", seconds: 30, color: "gray" },
        { id: uid("int"), title: "A - Set 1", seconds: 140, color: "green" },
        { id: uid("int"), title: "A - Set 2", seconds: 140, color: "yellow" },
        { id: uid("int"), title: "A - Set 3", seconds: 140, color: "red" },
      ],
    };
  }, []);

  const totalSeconds = timer.intervals.reduce((sum, i) => sum + i.seconds, 0);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>New Timer</h1>
        <Link
          href="/"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "white",
            textDecoration: "none",
            color: "#111",
            fontWeight: 600,
          }}
        >
          ← Back
        </Link>
      </header>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "white",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800 }}>{timer.name}</div>
        <div style={{ color: "#6b7280", marginTop: 6 }}>
          Total: {formatMMSS(totalSeconds)} • {timer.intervals.length} intervals
        </div>
      </section>

      <section style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {timer.intervals.map((i) => (
          <div
            key={i.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "white",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background:
                    i.color === "gray"
                      ? "#d1d5db"
                      : i.color === "green"
                      ? "#34d399"
                      : i.color === "yellow"
                      ? "#fbbf24"
                      : i.color === "red"
                      ? "#fb7185"
                      : "#60a5fa",
                }}
              />
              <div style={{ fontWeight: 700 }}>{i.title}</div>
            </div>

            <div style={{ fontVariantNumeric: "tabular-nums", fontWeight: 800 }}>
              {formatMMSS(i.seconds)}
            </div>
          </div>
        ))}
      </section>

      <section
        style={{
          marginTop: 18,
          padding: 16,
          border: "1px dashed #d1d5db",
          borderRadius: 12,
          background: "white",
          color: "#6b7280",
        }}
      >
        Next step: we’ll turn this into an editor so you can add/edit/reorder intervals and save timers.
      </section>
    </main>
  );
}
