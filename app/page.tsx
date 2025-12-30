"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
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
            fontWeight: 600,
          }}
        >
          + New Timer
        </Link>
      </header>

      <section
        style={{
          marginTop: 24,
          padding: 20,
          border: "1px dashed #ccc",
          borderRadius: 12,
          background: "white",
        }}
      >
        <p style={{ marginTop: 0 }}>
          This is the home screen for your Custom Timer app.
        </p>
        <p>
          Next, we’ll add the ability to create and run interval timers
          like Seconds Pro.
        </p>
      </section>
    </main>
  );
}
