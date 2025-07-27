import axios from "axios";

const axiosClient = axios.create({
    baseURL: "/",
    headers: {
        "Content-Type": "application/json"
    }
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("jwtToken");
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
