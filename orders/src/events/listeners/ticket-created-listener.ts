import { Listener, Subjects, TicketCreatedEvent } from "@jatin.parate/common";
import { Message } from "node-nats-streaming";
import Ticket from "../../models/Ticket";
import { queueGroupName } from "./queue-group-names";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(
    { title, price, id }: TicketCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const ticket = Ticket.build({
      title: title as string,
      price: price as number,
      ticketId: id,
    });

    await ticket.save();
    msg.ack();
  }
}
