export const DEFAULT_PROBES_KEY = "problemInitialProbes";

export function saveProbesToLocalStorage(problemId, probe) {
  let storedData = localStorage.getItem(DEFAULT_PROBES_KEY);

  let probeMap;
  if (!storedData) {
    probeMap = new Map();
  } else {
    let parsedObject = JSON.parse(storedData);
    probeMap = new Map(Object.entries(parsedObject));
  }

  probeMap.set(problemId, probe);
  localStorage.setItem(
    DEFAULT_PROBES_KEY,
    JSON.stringify(Object.fromEntries(probeMap)),
  );
}

export async function sha256Hex(input) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const bytes = new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
