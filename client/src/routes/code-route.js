import axiosClient from "./utils/axiosClient.js";
import { LANGUAGE_VERSIONS } from "@/components/text-editor/data/constants.js";
import isDev from "@/utils/envUtils.js";

const PISTON_API = axiosClient.create({
  baseURL: isDev() ? "/piston" : "https://emkc.org/api/v2/piston", //SELF HOSTED API: "http://170.64.241.58/api/v2"
});

export const executeOraclePistonDirect = async (
  language,
  template,
  inputVariables,
  modelAnswer,
) => {
  const src = template
    .replace("//VAR_INPUTS", inputVariables)
    .replace("//VAR_MODEL_SOLUTION", modelAnswer);
  return await executeCodePistonDirect(language, src);
};

export const executeCodePistonDirect = async (language, sourceCode) => {
  const response = await PISTON_API.post("/execute", {
    language: language,
    version: LANGUAGE_VERSIONS[language],
    files: [
      {
        content: sourceCode,
      },
    ],
  });
  return response.data;
};

export const executeChatTestCaseSilently = async (
  language,
  template,
  inputVariables,
  modelAnswer,
) => {
  const src = template
    .replace("//VAR_INPUTS", inputVariables)
    .replace("//VAR_MODEL_SOLUTION", modelAnswer);
  return await executeCodePistonDirectSilently(language, src);
};

/*
 * Completely similar to executeCodePistonDirect, but it returns the response, so we can check if there's a 429 response.
 * */
export const executeCodePistonDirectSilently = async (language, sourceCode) => {
  return await PISTON_API.post("/execute", {
    language: language,
    version: LANGUAGE_VERSIONS[language],
    files: [
      {
        content: sourceCode,
      },
    ],
  });
};

export const getRuntimes = async () => {
  const response = await PISTON_API.get("/runtimes");
  return response.data;
};
