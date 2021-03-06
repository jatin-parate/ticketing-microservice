import {OrderCreatedListener} from "../order-created-listener";
import Ticket from "../../../models/ticket";
import faker from "@faker-js/faker";
import {Types} from "mongoose";
import {OrderCreatedEvent, OrderStatus, Subjects} from "@jatin.parate/common";
import {natsWrapper} from "../../../nats-wrapper";
import Mock = jest.Mock;

describe('OrderCreatedListener', () => {
  const setup = async () => {
    const ticket = Ticket.build({
      title: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      userId: new Types.ObjectId().toHexString(),
    });

    await ticket.save();

    const msg = {ack: jest.fn()}
    const data: OrderCreatedEvent['data'] = {
      id: new Types.ObjectId().toHexString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
      version: 0,
      userId: new Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      expiresAt: faker.date.future().toISOString(),
    }
    const listener = new OrderCreatedListener(natsWrapper.client);

    return {ticket, msg, data, listener};
  }

  it('acks the message', async () => {
    const {msg, data, listener} = await setup();

    await listener.onMessage(data, msg as any);
    expect(msg.ack).toHaveBeenCalledTimes(1);
  });

  it('should update order id on ticket', async () => {
    const {listener, ticket, msg, data} = await setup();

    await listener.onMessage(data, msg as any);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.orderId).toEqual(data.id);
  });

  it('throws error if no ticket was found', async () => {
    const {listener, ticket, msg, data} = await setup();

    await Ticket.findByIdAndRemove(ticket.id);

    await expect(listener.onMessage(data, msg as any)).rejects.toThrow();
  });

  it('publishes ticket updated event', async () => {
    const {listener, ticket: {id: ticketId}, msg, data} = await setup();

    await listener.onMessage(data, msg as any);

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
    const [[subject, jsonString]] = (natsWrapper.client.publish as any as Mock).mock.calls;
    const ticket = await Ticket.findById(ticketId).exec();
    expect(subject).toEqual(Subjects.TicketUpdated);
    expect(JSON.parse(jsonString)).toMatchObject({
      id: ticket!.id,
      price: ticket!.price,
      title: ticket!.title,
      userId: ticket!.userId,
      version: ticket!.version,
      orderId: ticket!.orderId,
    });
  });
});