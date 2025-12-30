"use client";

import { useEffect, useState } from "react";
import { formatMMSS, parseMMSS } from "@/lib/utils";

export function DurationInput({
  seconds,
  onChangeSeconds,
}: {
  seconds: number;
  onChangeSeconds: (seconds: number) => void;
}) {
  const [text, setText] = useState(formatMMSS(seconds));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) setText(formatMMSS(seconds));
  }, [seconds, dirty]);

  function commit() {
    const parsed = parseMMSS(text);
    if (parsed === null) {
      setText(formatMMSS(seconds));
    } else {
      onChangeSeconds(parsed);
      setText(formatMMSS(parsed));
    }
    setDirty(false);
  }

  return (
    <input
      value={text}
      onChange={(e) => {
        setDirty(true);
        setText(e.target.value);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
      }}
      style={{
        width: 80,
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        textAlign: "center",
        fontVariantNumeric: "tabular-nums",
      }}
      inputMode="numeric"
      aria-label="Duration mm:ss"
    />
  );
}
