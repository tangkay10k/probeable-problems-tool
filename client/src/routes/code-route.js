import axios from "axios";
import { LANGUAGE_VERSIONS } from "@/components/text-editor/data/constants.js";

const PISTON_API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

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
  const res = await axios.post("/api/execution/probe", payload);
  return res.data;
};
