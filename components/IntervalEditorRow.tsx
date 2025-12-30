"use client";

import { Interval } from "@/lib/types";
import { TIMER_COLORS, getColorById } from "@/lib/colors";
import { ColorDropdown } from "@/components/ColorDropdown";

type Props = {
  interval: Interval;
  onChange: (next: Interval) => void;
  onDelete: () => void;
};

export function IntervalEditorRow({ interval, onChange, onDelete }: Props) {
  const selected = getColorById(interval.color);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 14,
        background: "white",
        display: "grid",
        gap: 12,
      }}
    >
      {/* Title + Delete */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={interval.title}
          onChange={(e) => onChange({ ...interval, title: e.target.value })}
          placeholder="Interval title"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            fontSize: 16,
            fontWeight: 700,
          }}
        />

        <button
          onClick={onDelete}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #fee2e2",
            background: "#fff1f2",
            fontWeight: 900,
            cursor: "pointer",
          }}
          title="Delete interval"
        >
          Delete
        </button>
      </div>

      {/* Seconds + Color dropdown */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "110px 140px 1fr",
          gap: 12,
          alignItems: "center",
        }}
      >
        <label style={{ fontWeight: 900 }}>Seconds</label>

        <input
          type="number"
          min={0}
          value={interval.seconds}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange({ ...interval, seconds: Number.isFinite(n) ? n : 0 });
          }}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            fontSize: 16,
            fontWeight: 800,
          }}
        />

        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 900 }}>Color</div>
          <ColorDropdown
            value={interval.color}
            onChange={(id) => onChange({ ...interval, color: id as any })}
          />
        </div>
      </div>

      {/* Small preview line */}
      <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 13 }}>
        <span>Selected: {selected.name}</span>
        <span>
          {TIMER_COLORS.length} colors available
        </span>
      </div>
    </div>
  );
}
