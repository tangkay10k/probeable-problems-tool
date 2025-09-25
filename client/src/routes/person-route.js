import { AUTH_TOKEN_KEY } from "@/constants/authConstants.js";
import axiosClient from "./utils/axiosClient.js";
import { AUTH_HEADER_KEY } from "@/constants/authConstants.js";
import { BEARER_PREFIX } from "@/constants/authConstants";

export const loginUser = async (googleUser, role) => {
  localStorage.removeItem(AUTH_TOKEN_KEY);

  const res = await axiosClient.post("/api/person/login", {
    role,
    email: googleUser.email,
    name: googleUser.name,
    userImage: googleUser.picture,
  });

  const authHeader = res.headers[AUTH_HEADER_KEY];
  const token = authHeader?.startsWith(BEARER_PREFIX)
    ? authHeader.slice(BEARER_PREFIX.length)
    : null;

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

export const getUserProfileSilently = async (userEmail) => {
  const res = await axiosClient.get(
    `/api/person/silently?userEmail=${userEmail}`,
  );
  return res.data;
};

export const getLeaderboard = async () => {
  const res = await axiosClient.get("/api/person/leaderboard");
  return res.data;
};
