import axios from "axios";
import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
  console.log(currentUser);
  return currentUser ? (
    <h1>Hi, {currentUser.email}. You are signed in!</h1>
  ) : (
    <h1>You are NOT signed in!</h1>
  );
};

LandingPage.getInitialProps = async (context) => {
  const { data } = await buildClient(context)
    .get("/api/users/currentuser")
    .catch((err) => {
      if (err.response?.status === 401) {
        return { data: { currentUser: null } };
      }

      throw err;
    });
  return data;
};

export default LandingPage;
