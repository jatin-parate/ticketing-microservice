import request from "supertest";
import faker from "@faker-js/faker";

import app from "../../app";
import Ticket from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/tickets for post request", async () => {
  const { statusCode } = await request(app).post("/api/tickets").send({});

  expect(statusCode).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  return request(app).post("/api/tickets").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const { cookie } = await signin();
  const { statusCode } = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});

  expect(statusCode).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
  const { cookie } = await signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "",
      price: faker.datatype.number(),
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      price: faker.datatype.number(),
    })
    .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  const { cookie } = await signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: faker.commerce.productName(),
      price: -10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: faker.commerce.productName(),
    })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  await expect(Ticket.count({})).resolves.toEqual(0);

  const { cookie } = await signin();

  const data = {
    title: faker.commerce.productName(),
    price: faker.datatype.number(),
  };

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send(data)
    .expect(201);

  await expect(Ticket.count()).resolves.toEqual(1);
});

it("publishes an event", async () => {
  await expect(Ticket.count({})).resolves.toEqual(0);

  const { cookie } = await signin();

  const data = {
    title: faker.commerce.productName(),
    price: faker.datatype.number(),
  };

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send(data)
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
