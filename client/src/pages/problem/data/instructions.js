export const STAGE_ONE_FULL = {
  title: "Tasks",
  content:
    "You are a software engineer. \n" +
    "\n" +
    "Your client needs software developed but lacks a technical background, so you must ask clear, careful questions to understand their exact requirements.\n" +
    "\n" +
    "You are also able run code in the Run tab" +
    " with" +
    " different inputs to determine functionality.\n" +
    "\n" +
    "Once you fully understand what the client wants, proceed to the next page.",
};

export const STAGE_ONE_ORACLE = {
  title: "Tasks",
  content:
    "You have been approached by a client who would like you to write a program for them, however, they have been a" +
    " little vague.\n\n" +
    "They have asked you to:\n\n" +
    "**//VAR_PROBLEM_STATEMENT**\n" +
    "\n" +
    "Before writing any code, please clarify what the function should do by checking it with various inputs. \n\nYou" +
    " can modify the inputs as many times as you like, and then click **Run** to observe the desired outputs. \n" +
    "\n\nOnce you are certain about how the function should behave, click **I’m ready to code!**\n",
};

export const STAGE_ONE_NATURAL_LANGUAGE = {
  title: "Tasks",
  content:
    "Your client has come back again and asked you to write more code for them. \n\n This time however, they are" +
    " able to answer your question directly.\n\n Talk with your client to find out more about what they want you to" +
    " write!\n\nOnce you understand what they want to write, click **I'm ready to code!**",
};

export const STAGE_ONE_CONCISE_FULL = {
  title: "Tasks",
  content:
    "You have been approached by a non-technical client. \n\n**Ask precise questions to clarify" +
    " requirements.**\n\n" +
    "You can test the function(s) behaviour with different inputs using the **Run** tab.\n\n" +
    "Once you’re confident in the requirements, proceed to implement your solution.",
};

export const STAGE_ONE_CONCISE_ORACLE = {
  title: "Tasks",
  content:
    "## Hello there! \nI want you to **//VAR_PROBLEM_STATEMENT**\n" +
    "\n" +
    "Before writing any code, please clarify what the function should do by checking it with various inputs. \n" +
    "\n" +
    "You can modify the inputs as many times as you like, and then click **Run** to observe the desired outputs. \n" +
    "\n" +
    "Once you are certain about how the function should behave, click **I’m ready to code!**\n",
};

export const STAGE_ONE_CONCISE_NATURAL_LANGUAGE = {
  title: "Tasks",
  content:
    "## Hello again! \n Thanks for that code that you wrote me last time, great stuff! Can you write me another bit" +
    " of" +
    " code?\n" +
    "\n" +
    "Fortunately I have my phone on me this time so you will be able to ask me any questions you have directly.\n\n" +
    " This time I want you to **//VAR_PROBLEM_STATEMENT**",
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
    " with your instructions and I'll build your code for you!",
};

export const CLIENT_HELP =
  "Talk with the client to find out more about what they want you to write!";

export const ORACLE_HELP =
  "You can play around with the inputs and click the **Run** button to see the expected output of the" +
  " function(s)!\n\nClicking **⟲** will reset inputs back to default values.";

export const PENALTY_WARNING = {
  content:
    "Each unsuccessful run will incur a **1% penalty** on your final score unless you" +
    " receive a compilation error. \n\n Your current penalty is: **//VAR_PENALTY%** \n\n *\*Penalties are capped at" +
    " 15%*",
};
