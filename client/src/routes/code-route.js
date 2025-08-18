import axiosClient from "./utils/axiosClient.js";
import { LANGUAGE_VERSIONS } from "@/components/text-editor/data/constants.js";

const PISTON_API = axiosClient.create({
  baseURL: "https://emkc.org/api/v2/piston",
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
