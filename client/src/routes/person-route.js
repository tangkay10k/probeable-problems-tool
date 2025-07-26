import axiosClient from "./utils/axiosClient.js";

export const getUser = async (googleUser, role) => {
    const res = await axiosClient.post("/api/person/login", {
        role,
        email:googleUser.email,
        name:googleUser.name,
        userImage:googleUser.picture
    });

    const authHeader = res.headers['authorization'];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (token) {
        localStorage.setItem("jwtToken", token);
    }

    return res.data;
};
