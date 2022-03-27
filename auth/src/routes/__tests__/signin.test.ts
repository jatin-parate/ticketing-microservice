import request from "supertest";
import faker from "@faker-js/faker";

import app from "../../app";

it("fails when a email that does not exists is supplied", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400);
});

it("fails when incorrect password supplied", async () => {
  const { email } = await signin();

  await request(app)
    .post("/api/users/signin")
    .send({
      email,
      password: faker.internet.password(4),
    })
    .expect(400);
});

it("responds with a cookie when given valid credentials", async () => {
  const { email, password } = await signin();

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email,
      password,
    })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});
