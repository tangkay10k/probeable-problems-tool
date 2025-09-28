/**
 * Convert a GCC/Clang C compilation error string into a concise, LeetCode‑style
 * message.  The output mimics the format used on LeetCode:
 *
 *   <file>: In function '<func>'
 *   Line <line>: Char <col>: error: <message> [<file>]
 *       <line> | <source code>
 *         | <pointer to error>
 *         | <optional suggestion>
 *
 * Only the first error is reported; subsequent errors are ignored so the user
 * focuses on the root cause.  Context lines (the code and caret) are taken
 * directly from the compiler output.
 *
 * @param {string} err compiler output
 * @returns {string} formatted message
 */
export default function parseCError(err) {
  const lines = err.split(/\r?\n/);
  let header = "";
  // find the line describing the function, e.g. "file.c: In function 'foo':"
  const fnLine = lines.find((l) => /: In function/.test(l));
  if (fnLine) {
    // strip trailing colon if present
    header = fnLine.replace(/:\s*$/, "").trim();
  }
  // find the first error line
  const errIndex = lines.findIndex((l) => /: error:/.test(l));
  if (errIndex === -1) {
    return header || "No error found.";
  }
  const errLine = lines[errIndex];
  // parse file, line and column
  const m = errLine.match(/^(.*?):(\d+):(\d+):\s+error:\s+(.*)$/);
  if (!m) {
    return header;
  }
  let [, file, lineNum, col, msg] = m;
  // LeetCode typically names the source file "solution.c"; if the error
  // references a generic filename like file0.code.c, rename it to solution.c
  const canonicalFile = file === "file0.code.c" ? "solution.c" : file;
  // Replace filename in header if necessary
  if (header && header.startsWith(file)) {
    header = header.replace(file, canonicalFile);
  }
  // Format the summary without the line and column numbers since LeetCode's
  // line numbers may not match the user's code. Only include the error
  // message and the canonical filename.
  let summary = `error: ${msg.trim()} [${canonicalFile}]`;
  // Extract snippet lines until another diagnostic appears. We will
  // include context lines from the compiler output to mimic LeetCode's
  // formatting, but adjust pointer alignment by collapsing any spacing
  // after the '|' to a single space. This ensures the caret '^~~~~' is
  // aligned immediately after the pipe.
  const snippet = [];
  for (let i = errIndex + 1; i < lines.length; i++) {
    const l = lines[i];
    // stop when another error or note line appears
    if (/^.*:\d+:\d+:/.test(l)) break;
    // ignore empty lines
    snippet.push(l);
  }
  const formattedSnippet = [];
  let pointerAdjustment = null;
  snippet.forEach((rawLine) => {
    // Trim trailing whitespace but keep leading whitespace
    let line = rawLine.replace(/\s+$/, "");
    // Check if this is a code line with a line number followed by a pipe
    const codeMatch = line.match(/^(\s*)(\d+)(\s*)\|(\s*)(.*)$/);
    if (codeMatch) {
      const indentSpaces = codeMatch[1];
      const digits = codeMatch[2];
      const spacesAfterDigits = codeMatch[3];
      const restOfCode = codeMatch[5];
      // Determine how many characters we remove: length of digits plus any spaces
      // after the digits. This adjustment will be applied to pointer lines.
      pointerAdjustment = digits.length + spacesAfterDigits.length;
      // Remove the line number and spaces, keep the indent and pipe
      // We add exactly one space after the pipe to separate it from code
      const newLine = indentSpaces + "| " + restOfCode;
      formattedSnippet.push("    " + newLine);
      return;
    }
    // If this is a pointer or suggestion line, adjust indent if we've removed
    // characters from the code line above. Pointer lines start with whitespace,
    // then a '|' character, followed by optional spaces and then the marker or suggestion.
    const pointerMatch = line.match(/^(\s*)\|(\s*)(.*)$/);
    if (pointerMatch && pointerAdjustment !== null) {
      let indent = pointerMatch[1];
      const rest = pointerMatch[3];
      // Remove pointerAdjustment spaces from the indent to align the pipe under
      // the code line's pipe, but do not reduce indent below zero.
      const remove = Math.min(pointerAdjustment, indent.length);
      indent = indent.substring(0, indent.length - remove);
      // Collapse any spaces after the pipe to a single space so the caret or suggestion
      // starts immediately after the pipe, as per user request.
      const newLine = indent + "| " + rest;
      formattedSnippet.push("    " + newLine);
      return;
    }
    // For any other line (should be rare), just indent it
    formattedSnippet.push("    " + line);
  });
  const resultParts = [];
  if (header) resultParts.push(header);
  resultParts.push(summary);
  resultParts.push(...formattedSnippet.filter(Boolean));
  return resultParts.join("\n");
}
