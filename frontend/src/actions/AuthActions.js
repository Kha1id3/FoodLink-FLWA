import Auth from "../utils/Auth.js";
import axios from "axios";
import { RECEIVE_USER } from "./ActionTypes.js";

export const receiveUserStatus = user => {
  return {
    type: RECEIVE_USER,
    user
  };
};

export const checkAuthenticateStatus = () => async (dispatch) => {
  try {
    const response = await axios.get("/api/sessions/isLoggedIn");
    const user = response.data;

    if (user.email === Auth.getToken()) {
      dispatch(
        receiveUserStatus({
          isLoggedIn: true,
          user: Auth.getToken(),
          userInfoObj: user,
        })
      );
    } else {
      if (user.email) {
        logoutUser();
      } else {
        Auth.deauthenticateUser();
        dispatch(
          receiveUserStatus({
            isLoggedIn: false,
            userInfoObj: { email: null },
          })
        );
      }
    }
  } catch (error) {
    console.error("Error checking authentication status:", error);
    Auth.deauthenticateUser();
    dispatch(
      receiveUserStatus({
        isLoggedIn: false,
        userInfoObj: { email: null },
      })
    );
  }
};
export const logoutUser = () => async (dispatch) => {
  try {
    await axios.post("/api/sessions/logout");
    Auth.deauthenticateUser();
    dispatch(
      receiveUserStatus({
        isLoggedIn: false,
        userInfoObj: { email: null },
      })
    );
  } catch (error) {
    console.error("Error during logout:", error);
  }
};
