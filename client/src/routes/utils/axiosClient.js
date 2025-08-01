import axios from "axios";
import { AUTH_TOKEN_KEY } from "@/constants/authConstants";
import { AUTH_HEADER_KEY } from "@/constants/authConstants";
import { BEARER_PREFIX } from "@/constants/authConstants";
import { USER_PROFILE_KEY } from "@/constants/personConstants";
import { getStaticLogOut } from "@/context/user-context";

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

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_PROFILE_KEY);

      const logOut = getStaticLogOut();
      logOut();
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
