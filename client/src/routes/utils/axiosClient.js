import axios from "axios";
import { AUTH_TOKEN_KEY } from "@/constants/authConstants";
import { AUTH_HEADER_KEY } from "@/constants/authConstants";
import { BEARER_PREFIX } from "@/constants/authConstants";

const axiosClient = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers[AUTH_HEADER_KEY] = `${BEARER_PREFIX}${token}`;
  }
  return config;
});

export default axiosClient;
