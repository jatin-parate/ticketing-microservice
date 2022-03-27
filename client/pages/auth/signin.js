import { useState } from "react";
import axios from "axios";
import Router from "next/router";

export default () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post("/api/users/signin", {
        email,
        password,
      });
      Router.push("/");
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors([{ message: "Something went wrong!" }]);
      }
    }
  };

  return (
    <div className="container mt-4">
      {errors.length > 0 &&
        errors.map((err, i) => (
          <div className="alert alert-danger" role="alert" key={i}>
            <strong>{err.message}</strong>
          </div>
        ))}
      <form onSubmit={onSubmit}>
        <div className="row">
          <div className="col-12">
            <h2>Signin form</h2>
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="email" className="col-sm-1-12 col-form-label">
            Email Address
          </label>
          <div className="col-sm-1-12">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="text"
              className="form-control"
              name="email"
              id="email"
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="password" className="col-sm-1-12 col-form-label">
            Password
          </label>
          <div className="col-sm-1-12">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="form-control"
              name="password"
              id="password"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-4">
          Submit
        </button>
      </form>
    </div>
  );
};
