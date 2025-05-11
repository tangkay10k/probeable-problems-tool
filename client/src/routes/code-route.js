import axios from "axios"
import {LANGUAGE_VERSIONS} from "../components/editor/constants.js";

const PISTON_API = axios.create({
    baseURL: "https://emkc.org/api/v2/piston"
})

export const executeCode = async (language, sourceCode) => {
    const response = await PISTON_API.post("/execute", {
        language: language,
        version: LANGUAGE_VERSIONS[language],
        files: [
            {
                // fileName: <- TO DO, use this instead of content in the future.
                content: sourceCode,
            },
        ],
    })
    return response.data;
}

export const getRuntimes = async () => {
    const response = await PISTON_API.get("/runtimes")
    return response.data;
}

export const executeProbe = async (payload) =>{
    const res = await axios.post("/api/execution/probe", payload)
    return res.data
}