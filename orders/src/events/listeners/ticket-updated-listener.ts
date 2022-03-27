import {
  Listener,
  Subjects,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from "@jatin.parate/common";
import { Message } from "node-nats-streaming";
import Ticket from "../../models/Ticket";
import { queueGroupName } from "./queue-group-names";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(
    data: TicketUpdatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error("Ticket not found!");
    }

    ticket.set({
      title: data.title,
      price: data.price,
    });

    await ticket.save();
    msg.ack();
  }
}
