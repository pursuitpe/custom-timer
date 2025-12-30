"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TIMER_COLORS, getColorById } from "@/lib/colors";

export function ColorDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (nextId: string) => void;
}) {
  const selected = useMemo(() => getColorById(value), [value]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      {/* Button that looks like a select */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: selected.bg,
          color: selected.text,
          fontWeight: 900,
          cursor: "pointer",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: selected.bg,
              border: selected.bg.toLowerCase() === "#ffffff" ? "1px solid rgba(0,0,0,0.25)" : "none",
            }}
          />
          {selected.name}
        </span>
        <span style={{ fontWeight: 900, opacity: 0.9 }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown list */}
      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 50,
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "white",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          }}
        >
          {TIMER_COLORS.map((c) => {
            const isSelected = c.id === value;

            return (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  border: "none",
                  cursor: "pointer",
                  background: isSelected ? "rgba(0,0,0,0.06)" : "white",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 6,
                      background: c.bg,
                      border: c.bg.toLowerCase() === "#ffffff" ? "1px solid rgba(0,0,0,0.25)" : "none",
                    }}
                  />
                  <span style={{ fontWeight: 900 }}>{c.name}</span>
                </span>

                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: c.bg,
                    color: c.text,
                    border: c.bg.toLowerCase() === "#ffffff" ? "1px solid rgba(0,0,0,0.25)" : "none",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  Aa
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
