import request from "supertest";
import app from "../../app";

it("clears the cookie after signing out", async () => {
  const { email, password } = await signin();

  await request(app)
    .post("/api/users/signin")
    .send({
      email,
      password,
    })
    .expect(200);

  const response = await request(app)
    .get("/api/users/signout")
    .send()
    .expect(200);

  expect(response.get("Set-Cookie")[0]).toEqual(
    "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
});
