import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    // Server
    return axios.create({
      baseURL: "http://my-service",
      headers: req.headers,
    });
  } else {
    // Browser
    return axios.create({
      baseURL: "/",
    });
  }
};
