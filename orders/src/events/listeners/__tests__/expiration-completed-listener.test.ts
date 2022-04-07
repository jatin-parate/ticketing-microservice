import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteEvent, OrderStatus, Subjects } from "@jatin.parate/common";
import faker from "@faker-js/faker";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import Ticket from "../../../models/Ticket";
import { ExpirationCompleteListener } from "../expiration-completed-listener";
import Order from "../../../models/order";

const setup = async () => {
  // create an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: faker.commerce.productName(),
    price: parseFloat(faker.commerce.price()),
    ticketId: new Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    ticket: ticket,
    userId: new Types.ObjectId().toHexString(),
    expiresAt: new Date(),
  });
  await order.save();

  // create a fake data event
  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // create a fake message object
  const msg: Partial<Message> = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order, ticket };
};

it("updates the order status to cancelled", async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg as any);

  // write assertions to make sure a ticket was created
  const updatedOrder = await Order.findById(data.orderId);
  expect(updatedOrder).toHaveProperty("status", OrderStatus.Cancelled);
});

it("emits an OrderCancelled event", async () => {
  const { listener, data, msg, order, ticket } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg as any);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
  const [event, stringData] = (natsWrapper.client.publish as jest.Mock).mock
    .calls[0];
  expect(event).toEqual(Subjects.OrderCancelled);
  const dataObj = JSON.parse(stringData);
  expect(dataObj).toMatchObject({
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: ticket.id,
    },
  });
});

it("acks the message", async () => {
  const { msg, data, listener } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg as any);

  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalledTimes(1);
});
