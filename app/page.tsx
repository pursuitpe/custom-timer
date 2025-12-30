"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getAllTimers, deleteTimer } from "@/lib/db";
import { Timer } from "@/lib/types";
import { formatMMSS } from "@/lib/utils";

function totalSeconds(t: Timer) {
  return t.intervals.reduce((sum, i) => sum + i.seconds, 0);
}

export default function HomePage() {
  const [timers, setTimers] = useState<Timer[]>([]);

  function refresh() {
    const all = getAllTimers();
    all.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    setTimers(all);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Custom Timers</h1>
        <Link
          href="/timer/new"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "#111",
            color: "white",
            textDecoration: "none",
            fontWeight: 800,
          }}
        >
          + New Timer
        </Link>
      </header>

      {timers.length === 0 ? (
        <section
          style={{
            marginTop: 18,
            padding: 18,
            border: "1px dashed #d1d5db",
            borderRadius: 12,
            background: "white",
            color: "#6b7280",
          }}
        >
          No saved timers yet. Click <strong>+ New Timer</strong> to create your first one.
        </section>
      ) : (
        <section style={{ marginTop: 18, display: "grid", gap: 12 }}>
          {timers.map((t) => (
            <div
              key={t.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 14,
                background: "white",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{t.name}</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>
                    Total: {formatMMSS(totalSeconds(t))} • {t.intervals.length} intervals
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Link
                    href={`/timer/${t.id}/run`}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #111",
                      background: "#111",
                      textDecoration: "none",
                      color: "white",
                      fontWeight: 800,
                    }}
                  >
                    Run
                  </Link>

                  <Link
                    href={`/timer/${t.id}/edit`}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      background: "white",
                      textDecoration: "none",
                      color: "#111",
                      fontWeight: 800,
                    }}
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => {
                      if (!confirm("Delete this timer?")) return;
                      deleteTimer(t.id);
                      refresh();
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #fee2e2",
                      background: "#fff1f2",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div style={{ color: "#6b7280", fontSize: 13 }}>
                Last updated: {new Date(t.updatedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
