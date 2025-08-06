import axiosClient from "./utils/axiosClient.js";

export const logPastedContent = async (problemAttemptId, pastedContent) => {
    const res = await axiosClient.post(`/log/paste/${problemAttemptId}`, pastedContent, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return res.data;
};
