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
  // Extract snippet lines until another diagnostic appears
  const snippet = [];
  for (let i = errIndex + 1; i < lines.length; i++) {
    const l = lines[i];
    // stop when another error or note line appears
    if (/^.*:\d+:\d+:/.test(l)) break;
    // ignore empty lines
    snippet.push(l);
  }
  // Format snippet lines with indentation
  const formattedSnippet = snippet.map((l) => "    " + l.trimEnd());
  const resultParts = [];
  if (header) resultParts.push(header);
  resultParts.push(summary);
  resultParts.push(...formattedSnippet.filter(Boolean));
  return resultParts.join("\n");
}
