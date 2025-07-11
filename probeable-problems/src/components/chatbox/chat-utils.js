export function convertIsoStringToLocalTime(isoString) {
  const date = new Date(isoString);

  const options = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleTimeString("en-NZ", options);
}
