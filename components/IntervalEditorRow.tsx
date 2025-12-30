"use client";

import { Interval } from "@/lib/types";
import { DurationInput } from "@/components/DurationInput";
import { ColorSelect, colorToHex } from "@/components/ColorSelect";

export function IntervalEditorRow({
  interval,
  onChange,
  onDelete,
}: {
  interval: Interval;
  onChange: (next: Interval) => void;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "18px 1fr 110px 110px 90px",
        gap: 10,
        alignItems: "center",
        padding: "10px 12px",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "white",
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          background: colorToHex(interval.color),
          display: "inline-block",
        }}
      />

      <input
        value={interval.title}
        onChange={(e) => onChange({ ...interval, title: e.target.value })}
        style={{
          padding: "8px 10px",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
        }}
        placeholder="Interval name"
      />

      <DurationInput
        seconds={interval.seconds}
        onChangeSeconds={(s) => onChange({ ...interval, seconds: s })}
      />

      <ColorSelect value={interval.color} onChange={(c) => onChange({ ...interval, color: c })} />

      <button
        onClick={onDelete}
        style={{
          padding: "8px 10px",
          borderRadius: 10,
          border: "1px solid #fee2e2",
          background: "#fff1f2",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Delete
      </button>
    </div>
  );
}
