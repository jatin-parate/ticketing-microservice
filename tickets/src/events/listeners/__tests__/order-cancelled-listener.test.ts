import {OrderCancelledListener} from "../order-cancelled-listener";
import Ticket from "../../../models/ticket";
import faker from "@faker-js/faker";
import {Types} from "mongoose";
import {OrderCancelledEvent, Subjects} from "@jatin.parate/common";
import {natsWrapper} from "../../../nats-wrapper";
import Mock = jest.Mock;

describe('OrderCancelledListener', () => {
  const setup = async () => {
    const ticket = Ticket.build({
      title: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      userId: new Types.ObjectId().toHexString(),
    });

    await ticket.save();

    const msg = {ack: jest.fn()}
    const data: OrderCancelledEvent['data'] = {
      id: new Types.ObjectId().toHexString(),
      ticket: {
        id: ticket.id,
      },
      version: 0,
    }
    const listener = new OrderCancelledListener(natsWrapper.client);

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
    expect(updatedTicket!.orderId).not.toBeDefined();
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
    const updatedObject = JSON.parse(jsonString);
    expect(updatedObject).not.toHaveProperty('orderId');
    expect(updatedObject).toMatchObject({
      id: ticket!.id,
      price: ticket!.price,
      title: ticket!.title,
      userId: ticket!.userId,
      version: ticket!.version,
    });
  });
});