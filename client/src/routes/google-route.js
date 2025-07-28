import axios from "axios";
import { BEARER_PREFIX } from "@/constants/authConstants";

export const getGoogleUser = async (user) => {
    const res =   await axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
            headers: {
                Authorization: `${BEARER_PREFIX}${user.access_token}`,
                Accept: 'application/json'
            }
        })
    return res.data;
};
