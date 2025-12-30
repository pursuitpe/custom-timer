"use client";

import { IntervalColor } from "@/lib/types";

export const COLORS: IntervalColor[] = ["gray", "green", "yellow", "red", "blue"];

export function colorToHex(color: IntervalColor) {
  return color === "gray"
    ? "#d1d5db"
    : color === "green"
    ? "#34d399"
    : color === "yellow"
    ? "#fbbf24"
    : color === "red"
    ? "#fb7185"
    : "#60a5fa";
}

export function ColorSelect({
  value,
  onChange,
}: {
  value: IntervalColor;
  onChange: (c: IntervalColor) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as IntervalColor)}
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
      }}
      aria-label="Color"
    >
      {COLORS.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
