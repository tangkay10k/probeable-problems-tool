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
  granularity = "char",
  showInvisible = true,
  sideBySide = true,
}) {
  const parts = makeDiff(expected, actual, granularity);

  if (!sideBySide) {
    return <div className="diff merged">{toSpans(parts, showInvisible)}</div>;
  }

  // Side-by-side: derive left/right streams from a common diff
  const left = parts.map((p) => ({
    ...p,
    value: p.removed || !p.added ? p.value : "",
  }));
  const right = parts.map((p) => ({
    ...p,
    value: p.added || !p.removed ? p.value : "",
  }));

  return (
    <div className="diff sxs">
      <div className="panel">
        <div className="panel-title">Expected</div>
        <pre className="code">{toSpans(left, showInvisible)}</pre>
      </div>
      <div className="panel">
        <div className="panel-title">Actual</div>
        <pre className="code">{toSpans(right, showInvisible)}</pre>
      </div>
    </div>
  );
}

// ---- helpers ----

function visualizeInvisibles(s) {
  return s
    .replace(/ /g, " ") // space
    .replace(/\t/g, "→\t") // tab (arrow marker, keep width)
    .replace(/\r/g, "␍") // carriage return
    .replace(/\n/g, "\\n"); // newline marker + real line break
}

function toSpans(parts, showInvis) {
  return parts.map((p, i) => {
    const cls = p.added ? "diff-ins" : p.removed ? "diff-del" : "diff-same";
    const text = showInvis ? visualizeInvisibles(p.value) : p.value;

    // Preserve line breaks for wrapping while keeping markers visible
    const nodes = text.split("\n").flatMap((line, j, arr) => {
      const chunk = (
        <span key={`${i}-${j}`} className={cls}>
          {line}
        </span>
      );
      return j < arr.length - 1
        ? [chunk, <br key={`${i}-${j}-br`} />]
        : [chunk];
    });

    return <Fragment key={i}>{nodes}</Fragment>;
  });
}

function makeDiff(a, b, level) {
  if (level === "line") return JsDiff.diffLines(a, b);
  if (level === "word") return JsDiff.diffWords(a, b);
  return JsDiff.diffChars(a, b); // default char-level
}
