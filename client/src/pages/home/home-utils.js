export function getRandomSubheading() {
  const messages = [
    "Get ready to solve some problems!",
    "🥚Minecraft made me choose software engineering ~10k",
    "Time to flex those brain muscles!",
    "Let's dive into some challenges!",
    "Sharpen your mind—it's problem time!",
    "Ready to crack some code?",
    "Let the problem-solving begin!",
    "Roll up your sleeves—let’s get solving!",
    "Challenge accepted. Let’s solve!",
    "Your next problem awaits!",
  ];

  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}
