import axiosClient from "./utils/axiosClient.js";
import { LANGUAGE_VERSIONS } from "@/components/text-editor/data/constants.js";

const PISTON_API = axiosClient.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

export const executeOraclePistonDirect = async (
  language,
  template,
  inputVariables,
  modelAnswer
) => {
  const src = template.replace("//VAR_INPUTS", inputVariables).replace("//VAR_MODEL_SOLUTION", modelAnswer);
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

export const getRuntimes = async () => {
  const response = await PISTON_API.get("/runtimes");
  return response.data;
};

export const executeProbe = async (payload) => {
  const res = await axiosClient.post("/api/execution/probe", payload);
  return res.data;
};
