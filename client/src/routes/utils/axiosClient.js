import axios from "axios";
import { authTokenName } from "@/constants/authConstants";
import { authHeaderName } from "@/constants/authConstants";

const axiosClient = axios.create({
    baseURL: "/",
    headers: {
        "Content-Type": "application/json"
    }
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(authTokenName);
    if (token) {
        config.headers[authHeaderName]  = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;
