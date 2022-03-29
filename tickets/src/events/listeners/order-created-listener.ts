import {Listener, OrderCreatedEvent, Subjects} from "@jatin.parate/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import Ticket from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";
import {natsWrapper} from "../../nats-wrapper";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  queueGroupName = queueGroupName;
  subject: OrderCreatedEvent["subject"] = Subjects.OrderCreated;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id).exec();

    // If no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found!');
    }

    if (ticket.orderId != null) {
      throw new Error('The ticket is already reserved!');
    }

    // Mark the ticket as being reserved by settings it's orderId property
    ticket.orderId = data.id;

    // Save the ticket
    await ticket.save();
    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
    });

    //ack the message
    msg.ack();
  }
}