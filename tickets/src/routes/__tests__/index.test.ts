import request from "supertest";
import faker from "@faker-js/faker";
import app from "../../app";

jest.mock('../../nats-wrapper');

const createTicket = (cookie: string[]) => {
  const data = {
    title: faker.commerce.productName(),
    price: faker.datatype.number(),
  };

  return request(app).post("/api/tickets").set("Cookie", cookie).send(data);
};

it("can fetch a list of tickets", async () => {
  const { cookie } = await signin();

  await Promise.all([createTicket(cookie), createTicket(cookie)]);

  const { body } = await request(app).get("/api/tickets").send().expect(200);

  expect(body).toHaveLength(2);
});
