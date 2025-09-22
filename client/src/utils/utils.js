/**
 * Sleep function used to rate limit piston executions. default is 1000ms since PISTON API limits 5 requests per second.
 *
 * */
export function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function stripCommentsFromCode(code) {
  return (
    code
      // remove block comments
      .replace(/\/\*[\s\S]*?\*\//g, "")
      // remove line comments
      .replace(/\/\/.*$/gm, "")
  );
}

// Escapes a string for safe use inside a RegExp
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Replaces multiple placeholders in instruction.content.
 *
 * @param {{content: string}|string} instruction  - object with `.content` or a plain string
 * @param {Record<string, string>} replacements   - e.g. { "//VAR_PROBLEM_STATEMENT": "...", "//FUNCTION_SIGNATURE": "..." }
 * @param {{ lowercase?: boolean }} [opts]        - lowercase all replacement values (default: true)
 * @returns {string}
 */
export function formatInstruction(instruction, replacements, opts = {}) {
  const { lowercase = true } = opts;
  let text =
    typeof instruction === "string" ? instruction : (instruction.content ?? "");

  for (const [name, value] of Object.entries(replacements || {})) {
    const pattern = new RegExp(escapeRegExp(name), "g");
    const replacement = lowercase ? String(value).toLowerCase() : String(value);
    text = text.replace(pattern, replacement);
  }

  text = text.replace(/\[example\]\s*/g, "");

  return text;
}
