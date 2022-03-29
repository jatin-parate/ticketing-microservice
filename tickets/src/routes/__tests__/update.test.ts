import request from "supertest";
import { Types } from "mongoose";
import faker from "@faker-js/faker";

import app from "../../app";
import Ticket from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

const generateValidData = () => ({
  title: faker.commerce.productName(),
  price: faker.datatype.number(),
});

const createTicket = (cookie: string[]) => {
  const data = {
    title: faker.commerce.productName(),
    price: faker.datatype.number(),
  };

  return request(app).post("/api/tickets").set("Cookie", cookie).send(data);
};

it("returns a 404 if the provided id does not exists", (done) => {
  signin()
    .then(({ cookie }) => {
      request(app)
        .put(`/api/tickets/${new Types.ObjectId().toHexString()}`)
        .set("Cookie", cookie)
        .send(generateValidData())
        .expect(404, (err, res) => {
          if (err) {
            console.log(err, res.body);
            done(err);
            return;
          }

          done();
        });
    })
    .catch(done);
});

it("returns a 401 if the user is not authenticated", async () => {
  await request(app)
    .put(`/api/tickets/${new Types.ObjectId().toHexString()}`)
    .send(generateValidData())
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const { cookie: firstUserCookie } = await signin();
  const {
    body: { id },
  } = await createTicket(firstUserCookie);

  const { cookie } = await signin();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send(generateValidData())
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const { cookie } = await signin();
  const {
    body: { id },
  } = await createTicket(cookie);

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({
      ...generateValidData(),
      title: "",
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({
      ...generateValidData(),
      title: undefined,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({
      ...generateValidData(),
      price: -10,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({
      ...generateValidData(),
      price: undefined,
    })
    .expect(400);
});

it("updates the ticket provided valid inputs", (done) => {
  signin()
    .then(async ({ cookie }) => {
      const {
        body: { id },
      } = await createTicket(cookie);
      return { id, cookie };
    })
    .then(({ id, cookie }) => {
      const updatedData = generateValidData();

      request(app)
        .put(`/api/tickets/${id}`)
        .set("Cookie", cookie)
        .send(updatedData)
        .expect(200, async (err, res) => {
          if (err) {
            console.log(err, res.body);

            done(err);
            return;
          }

          const updatedTicketInDb = await Ticket.findById(id);

          expect(updatedTicketInDb).not.toBeFalsy();
          expect(updatedTicketInDb!.toJSON()).toMatchObject(updatedData);
        });
    })
    .catch(done);
});

it("emits event successfully", async () => {
  const { cookie } = await signin();
  const {
    body: { id },
  } = await createTicket(cookie);
  const updatedData = generateValidData();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send(updatedData)
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});


it('rejects update if the ticket is reserved', async () => {
  const { cookie } = await signin();
  const {
    body: { id },
  } = await createTicket(cookie);

  await Ticket.findByIdAndUpdate(id, { orderId: new Types.ObjectId().toHexString() });
  const updatedData = generateValidData();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send(updatedData)
    .expect(400);
})