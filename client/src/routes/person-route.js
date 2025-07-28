import { authTokenName } from "@/constants/authConstants.js";
import axiosClient from "./utils/axiosClient.js";
import { authHeaderName } from "@/constants/authConstants.js";

export const loginUser = async (googleUser, role) => {
    const res = await axiosClient.post("/api/person/login", {
        role,
        email: googleUser.email,
        name: googleUser.name,
        userImage: googleUser.picture
    });

    const authHeader = res.headers[authHeaderName];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (token) {
        localStorage.setItem(authTokenName, token);
    }

    return res.data;
};

export const logoutUser = async () => {
    try {
        await axiosClient.post("/api/person/logout");
    } catch (err) {
        console.warn("Logout request failed, but continuing to remove token:", err);
    }

    localStorage.removeItem(authTokenName);
};
