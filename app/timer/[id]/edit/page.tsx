"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Timer, Interval } from "@/lib/types";
import { getTimerById, saveTimer } from "@/lib/db";
import { formatMMSS, uid } from "@/lib/utils";
import { IntervalEditorRow } from "@/components/IntervalEditorRow";

export default function EditTimerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [timer, setTimer] = useState<Timer | null>(null);

  useEffect(() => {
    const found = getTimerById(params.id);
    setTimer(found);
  }, [params.id]);

  if (!timer) {
    return (
      <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
        <p>Timer not found.</p>
        <Link href="/">← Back to Home</Link>
      </main>
    );
  }

  const totalSeconds = timer.intervals.reduce((sum, i) => sum + i.seconds, 0);

  function updateInterval(next: Interval) {
    setTimer((t) =>
      !t
        ? t
        : {
            ...t,
            intervals: t.intervals.map((i) => (i.id === next.id ? next : i)),
            updatedAt: new Date().toISOString(),
          }
    );
  }

  function deleteInterval(id: string) {
    setTimer((t) =>
      !t
        ? t
        : {
            ...t,
            intervals: t.intervals.filter((i) => i.id !== id),
            updatedAt: new Date().toISOString(),
          }
    );
  }

  function addInterval() {
    setTimer((t) =>
      !t
        ? t
        : {
            ...t,
            intervals: [
              ...t.intervals,
              { id: uid("int"), title: "New Interval", seconds: 60, color: "gray" },
            ],
            updatedAt: new Date().toISOString(),
          }
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Edit Timer</h1>
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
          display: "grid",
          gap: 10,
        }}
      >
        <label style={{ fontWeight: 800 }}>Name</label>
        <input
          value={timer.name}
          onChange={(e) =>
            setTimer((t) =>
              !t ? t : { ...t, name: e.target.value, updatedAt: new Date().toISOString() }
            )
          }
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            fontSize: 16,
            fontWeight: 700,
          }}
        />

        <div style={{ color: "#6b7280" }}>
          Total: {formatMMSS(totalSeconds)} • {timer.intervals.length} intervals
        </div>
      </section>

      <section style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {timer.intervals.map((i) => (
          <IntervalEditorRow
            key={i.id}
            interval={i}
            onChange={updateInterval}
            onDelete={() => deleteInterval(i.id)}
          />
        ))}
      </section>

      <button
        onClick={addInterval}
        style={{
          marginTop: 14,
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "white",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        + Add Interval
      </button>

      <button
        onClick={() => {
          saveTimer(timer);
          router.push("/");
        }}
        style={{
          marginTop: 12,
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #111",
          background: "#111",
          color: "white",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        Save Changes
      </button>
    </main>
  );
}
