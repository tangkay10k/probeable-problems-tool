import axios from "axios"

export const submitThoughtProcess = async (payload) => {
    const res = await axios.post("/api/ai", payload)
    return res.data
}

export const checkQuestionDuplication = async (payload) => {
    const res = await axios.post("/api/ai/duplicate", payload)
    return res.data
}