export function getRandomRateLimitText() {
  const messages = [
    "Get ready to solve some problems!",
    "I'm out for coffee atm ☕️. Can you ask me again later 🙏",
    "Fighting a bear 🧸, talk to me in a bit.",
    "Saving the world, ask me again in a sec",
  ];

  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}
