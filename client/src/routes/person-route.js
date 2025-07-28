import { AUTH_TOKEN_KEY } from "@/constants/authConstants.js";
import axiosClient from "./utils/axiosClient.js";
import { AUTH_HEADER_KEY } from "@/constants/authConstants.js";

export const loginUser = async (googleUser, role) => {
    localStorage.removeItem(AUTH_TOKEN_KEY);

    const res = await axiosClient.post("/api/person/login", {
        role,
        email: googleUser.email,
        name: googleUser.name,
        userImage: googleUser.picture
    });

    const authHeader = res.headers[AUTH_HEADER_KEY];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    }

    return res.data;
};

export const logoutUser = async () => {
    try {
        await axiosClient.post("/api/person/logout");
    } catch (err) {
        console.warn("Logout request failed, but continuing to remove token:", err);
    }

    localStorage.removeItem(AUTH_TOKEN_KEY);
};
