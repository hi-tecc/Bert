import * as React from "react";

/** Render the final word of a string in italic gold for editorial emphasis. */
export function emphasizeLastWord(text: string): React.ReactNode {
  const parts = text.trim().split(" ");
  if (parts.length < 2) return text;
  const last = parts.pop();
  return (
    <>
      {parts.join(" ")}{" "}
      <span className="italic text-[var(--color-accent)]">{last}</span>
    </>
  );
}
