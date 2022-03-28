import {TicketCreatedListener} from "../ticket-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {TicketCreatedEvent} from "@jatin.parate/common";
import faker from '@faker-js/faker'
import {Types} from "mongoose";
import {Message} from "node-nats-streaming";
import Ticket from "../../../models/Ticket";

const setup = () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new Types.ObjectId().toHexString(),
    title: faker.commerce.productName(),
    price: parseFloat(faker.commerce.price()),
    userId: new Types.ObjectId().toHexString(),
  }

  // create a fake message object
  const msg: Partial<Message> = {
    ack: jest.fn(),
  }

  return {listener, data, msg};
}

it('creates and saves a ticket', async () => {
  const { listener, data, msg  } = setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg as any);

  // write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket).toMatchObject({
    title: data.title,
    price: data.price,
  })
});

it('acks the message', async () => {
  const { msg, data, listener } = setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg as any);

  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalledTimes(1);
})