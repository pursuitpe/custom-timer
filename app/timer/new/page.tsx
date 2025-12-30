"use client";

import Link from "next/link";

export default function NewTimerPage() {
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
          marginTop: 24,
          padding: 20,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "white",
        }}
      >
        <p style={{ marginTop: 0 }}>
          Routing is working. Next we’ll build the timer editor here.
        </p>
      </section>
    </main>
  );
}
