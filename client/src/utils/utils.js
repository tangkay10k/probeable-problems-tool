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

export function formatInstruction(
  instruction,
  replacement,
  replacementName = "//VAR_PROBLEM_STATEMENT",
) {
  return instruction.content.replace(
    replacementName,
    replacement.toLowerCase(),
  );
}
