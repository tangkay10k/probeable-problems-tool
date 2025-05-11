import axios from "axios"

export const submitThoughtProcess = async (payload) => {
    const res = await axios.post("/api/ai", payload)
    return res.data
}