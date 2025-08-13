export const STAGE_ONE = {
  title: "Tasks",
  content:
    "You are a software engineer. \n" +
    "\n" +
    "Your client needs software developed but lacks a technical background, so you must ask clear, careful questions to understand their exact requirements.\n" +
    "\n" +
    "Your client has also provided the binary of similar software. You can test this binary" +
    " with" +
    " different inputs to determine functionality.\n" +
    "\n" +
    "Once you fully understand what the client wants, proceed to the next page.",
};

export const STAGE_ONE_CONCISE = {
  title: "Tasks",
  content:
    "Your client is non-technical. Ask precise questions to clarify requirements.\n\n" +
    "You can test the function(s) behaviour with different inputs using the **Binary**.\n\n" +
    "Once you’re confident in the requirements, go to the next page.",
};

export const STAGE_TWO = {
  title: "Tasks",
  content: `Now that you understand what your client is looking for, its time for you to deliver a solution that meets their requirements!

Your company has leased you an AI agent named Cogs that you can use to help write your code for you if you wish!
`,
};

export const STAGE_TWO_CONCISE = {
  title: "Tasks",
  content: `Its time for you to deliver a solution that meets your client's requirements!

Your company has leased you an AI agent named **Cogs** that can help write code for you!
`,
};
