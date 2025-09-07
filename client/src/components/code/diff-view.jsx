import React, { Fragment } from "react";
import * as JsDiff from "diff";
import "./DiffView.css";

/**
 * @param {Object} props
 * @param {string} props.expected
 * @param {string} props.actual
 * @param {"char"|"word"|"line"} [props.granularity="char"]
 * @param {boolean} [props.showInvisible=true]
 * @param {boolean} [props.sideBySide=true]
 */
export default function DiffView({
  expected,
  actual,
  granularity = "word",
  showInvisible = true,
  sideBySide = true,
}) {
  // Normalize inputs so we never pass null/undefined to JsDiff
  const safeExpected = String(expected ?? "");
  const safeActual = String(actual ?? "");

  const parts = makeDiff(safeExpected, safeActual, granularity);

  if (!sideBySide) {
    const isMergedEmpty = parts.length === 0;
    return (
      <div className="diff merged">
        {isMergedEmpty ? (
          <EmptyPlaceholder showInvisible={showInvisible} />
        ) : (
          toSpans(parts, showInvisible)
        )}
      </div>
    );
  }

  // Side-by-side: derive left/right streams from a common diff
  const { left, right } = splitForSideBySide(parts, granularity);

  const leftIsEmpty = left.every((p) => !p.value);
  const rightIsEmpty = right.every((p) => !p.value);

  return (
    <div className="diff sxs">
      <div className="panel">
        <div className="panel-title">Expected</div>
        <pre className="code">
          {leftIsEmpty ? (
            <EmptyPlaceholder showInvisible={showInvisible} />
          ) : (
            toSpans(left, showInvisible)
          )}
        </pre>
      </div>
      <div className="panel">
        <div className="panel-title">Actual</div>
        <pre className="code">
          {rightIsEmpty ? (
            <EmptyPlaceholder showInvisible={showInvisible} />
          ) : (
            toSpans(right, showInvisible)
          )}
        </pre>
      </div>
    </div>
  );
}

// ---- helpers ----

function EmptyPlaceholder({ showInvisible }) {
  // Use ∅ (empty set) when invisibles are shown, otherwise a subtle label
  return (
    <span className="diff-empty">
      {showInvisible ? "∅ (empty string)" : "(empty)"}
    </span>
  );
}

function visualizeInvisibles(s) {
  return s
    .replace(/ /g, " ") // visualize spaces as middle dots if desired
    .replace(/\t/g, "→\t") // tab (arrow marker, keep width)
    .replace(/\r/g, "␍") // carriage return
    .replace(/\n/g, "\\n\n"); // show \n + keep real line break
}

function toSpans(parts, showInvis) {
  return parts.flatMap((p, i) => {
    const cls = p.changed
      ? "diff-change"
      : p.added
        ? "diff-ins"
        : p.removed
          ? "diff-del"
          : "diff-same";

    const raw = p.value ?? "";
    const text = showInvis ? visualizeInvisibles(raw) : raw;

    // If there's nothing to show, emit nothing (lets :empty collapse layout)
    if (text.length === 0) return [];

    // Render lines, keeping explicit newlines via <br>, but no extra spaces
    return text.split("\n").flatMap((line, j, arr) => {
      const span = (
        <span key={`${i}-${j}`} className={cls}>
          {line}
        </span>
      );
      return j < arr.length - 1 ? [span, <br key={`${i}-${j}-br`} />] : [span];
    });
  });
}

function makeDiff(a, b, level) {
  if (level === "line") return JsDiff.diffLines(a, b);
  if (level === "word") return JsDiff.diffWords(a, b);
  return JsDiff.diffChars(a, b); // default char-level
}

/**
 * Convert diff "parts" into left/right streams for side-by-side view.
 * Special case: if we see a single-character removed+added (in either order),
 * treat it as a REPLACEMENT and mark both sides with { changed: true }.
 */
function splitForSideBySide(parts, granularity) {
  const left = [];
  const right = [];
  const isChar = granularity === "char";

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const n = parts[i + 1];

    // Detect a 1-char replacement pair (remove+add or add+remove)
    if (isChar && n && ((p.removed && n.added) || (p.added && n.removed))) {
      const a = p.removed ? p : n; // expected (removed)
      const b = p.added ? p : n; // actual (added)

      if (
        a.value.length === 1 &&
        b.value.length === 1 &&
        !a.value.includes("\n") &&
        !b.value.includes("\n")
      ) {
        left.push({ value: a.value, changed: true });
        right.push({ value: b.value, changed: true });
        i++; // consume the pair
        continue;
      }
    }

    // Default mapping
    left.push({ ...p, value: p.removed || !p.added ? p.value : "" });
    right.push({ ...p, value: p.added || !p.removed ? p.value : "" });
  }

  return { left, right };
}
