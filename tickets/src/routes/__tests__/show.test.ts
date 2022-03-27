import request from "supertest";
import { Types } from "mongoose";
import faker from "@faker-js/faker";

import app from "../../app";

jest.mock('../../nats-wrapper');

it("returns a 404 if the ticket is not found", async () => {
  await request(app)
    .get("/api/tickets/" + new Types.ObjectId())
    .send()
    .expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const { cookie } = await signin();

  const data = {
    title: faker.commerce.productName(),
    price: faker.datatype.number(),
  };

  const { body: ticket } = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send(data);
  

  const res = await request(app)
    .get(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(res.body).toMatchObject(ticket);
});
