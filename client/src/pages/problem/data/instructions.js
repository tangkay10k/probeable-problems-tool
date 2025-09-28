export const STAGE_ONE_FULL = {
  title: "Tasks",
  content:
    "Your client is back from vacation and is asking you to write another program for them. \n" +
    "\n" +
    "You are able to clarify what the program should do by asking them questions or by checking it with various" +
    " inputs using the **Run** tab. \n\n" +
    "Once you fully understand what the client wants, click **I'm ready to code!**",
};

export const STAGE_ONE_ORACLE = {
  title: "Tasks",
  content:
    "Your client is on vacation but would still like you to write a program for them, however, they have been a" +
    " little vague.\n\n" +
    "They have asked you to:\n\n" +
    "**//VAR_PROBLEM_STATEMENT**\n" +
    "\n" +
    "Before writing any code, please clarify what the program should do by checking it with various inputs. \n\nYou" +
    " can modify the inputs as many times as you like, and then click **Run** to observe the desired outputs. \n" +
    "\n\nOnce you are certain about how the program should behave, click **I’m ready to code!**\n",
};

export const STAGE_ONE_NATURAL_LANGUAGE = {
  title: "Tasks",
  content:
    "You have been approached by a client who would like you to write a program for them, however, they have been a" +
    " little vague.\n\n" +
    "Before writing any code, please clarify with the client about what the program should do." +
    "\n\nOnce you are certain about how the program should behave, click **I’m ready to code!**\n",
};

export const STAGE_ONE_EXAMPLE = {
  title: "Example (not marked)",
  content:
    "This is a tutorial question for you to familiarise yourself with the application and is not" +
    " worth any Dennies." +
    " \n\n" +
    "Clarify what you need to do by asking the client questions, or by testing different" +
    " inputs to the program using the **Run** tab.\n\n" +
    "Once you are confident that you understand what the client wants, click **I'm ready to code!**",
};

export const STAGE_ONE_CONCISE_FULL = {
  title: "Tasks",
  content:
    "## Hello champ! \nI'm back from vacation now so I'm available to answer your questions again 😎\n\nI want you to" +
    " **//VAR_PROBLEM_STATEMENT**\n\n" +
    "You can also clarify the program's behaviour with different inputs using the **Run** tab.\n\n" +
    "Once you’re confident in the requirements, proceed to implement your solution.",
};

export const STAGE_ONE_CONCISE_EXAMPLE = {
  title: "Tasks",
  content:
    "## Welcome! 👋\nThis is a tutorial question for you to familiarise yourself with the application.\n\n" +
    "**This question does not earn any Dennies**.\n\n" +
    "I want you to **//VAR_PROBLEM_STATEMENT**\n\n" +
    "Once you’re confident in the requirements, proceed to implement your solution.",
};

export const STAGE_ONE_CONCISE_NATURAL_LANGUAGE = {
  title: "Tasks",
  content:
    "## Hello there! \nI want you to **//VAR_PROBLEM_STATEMENT**\n" +
    "\n" +
    "Before writing any code, please clarify with me about what the program should do." +
    " \n" +
    "\n" +
    "Once you are certain about how the program should behave, click **I’m ready to code!**\n",
};

export const STAGE_ONE_CONCISE_ORACLE = {
  title: "Tasks",
  content:
    "## Hello again! \n Thanks for that program that you wrote me last time, great stuff! Can you write me another" +
    " bit of code?\n\n" +
    "Unfortunately, I'm on holiday so I will not be able to answer your questions directly.\n\n" +
    "Instead, clarify what the program should do by checking it with various inputs." +
    "\n\n" +
    "You can modify the inputs as many times as you like, and then click **Run** to observe the desired outputs. \n\n" +
    "Please **//VAR_PROBLEM_STATEMENT**",
};
export const STAGE_TWO = {
  title: "Tasks",
  content: `Now that you understand what your client is looking for, its time for you to deliver a solution that meets their requirements!

Your company has leased you an AI agent named Cogs that you can use to help write your code for you if you wish!
`,
};

export const STAGE_TWO_CONCISE = {
  title: "Tasks",
  content:
    "## Beep Boop, I am Cogs!\n\n I'm here to help you write code efficiently. \n\n Please give me detailed" +
    " instructions on what to write so I can give you my very best work ✨ \n\n Click **Build** when you are happy" +
    " with your instructions and I'll build your code for you! \n\nFeel free to write code in the editor yourself as" +
    " well!",
};

export const CLIENT_HELP =
  "Talk with the client to find out more about what they want you to write!";

export const ORACLE_HELP =
  "You can play around with the inputs and click the **Run** button to see the expected output of the" +
  " program!\n\nClicking **⟲** will reset inputs back to default values.";

export const PENALTY_WARNING = {
  content:
    "Each unsuccessful run will incur a **1 point penalty** on your final score for **this problem** unless you" +
    " receive a compilation error. \n\n Your current penalty is: **//VAR_PENALTY point//VAR_PLURAL** \n" +
    " *\*Penalties are" +
    " capped at" +
    " 15 points*\n\n**Your highest score will be kept.**",
};
