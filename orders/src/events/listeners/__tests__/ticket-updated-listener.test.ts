import {TicketUpdatedListener} from "../ticket-updated-listener";
import {natsWrapper} from "../../../nats-wrapper";
import Ticket from "../../../models/Ticket";
import faker from "@faker-js/faker";
import {Types} from "mongoose";
import {Message} from "node-nats-streaming";
import {TicketUpdatedEvent} from "@jatin.parate/common";

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    title: faker.commerce.productName(),
    ticketId: new Types.ObjectId().toHexString(),
    price: parseFloat(faker.commerce.price()),
  });

  await ticket.save();

  // create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    title: faker.commerce.productName(),
    price: parseFloat(faker.commerce.price()),
    userId: new Types.ObjectId().toHexString(),
    version: ticket.version + 1,
    id: ticket.id,
  }

  // create a fake msg object
  const message: Partial<Message> = {
    ack: jest.fn(),
  }


  // return all of this stuff
  return {message, data, ticket, listener};
}

it('finds, updates and saves a ticket', async () => {
  const {ticket, listener, message, data} = await setup();

  await listener.onMessage(data, message as any);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket).toMatchObject({
    title: data.title,
    price: data.price,
    version: data.version,
  })
});

it('acks the message', async () => {
  const {message, data, listener} = await setup();

  await listener.onMessage(data, message as any);

  expect(message.ack).toHaveBeenCalledTimes(1);
});

it('does not call ack if the event has a skipped version number', async () => {
  const {message, data, listener} = await setup();

  data.version = faker.datatype.number({min: data.version + 1});

  await expect(listener.onMessage(data, message as any)).rejects.toThrow();

  expect(message.ack).not.toHaveBeenCalled();
});
