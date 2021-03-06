import { Listener, OrderCreatedEvent, Subjects } from "@jatin.parate/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    expirationQueue.add(
      { orderId: data.id },
      {
        delay: Math.max(
          new Date(data.expiresAt).getTime() - new Date().getTime(),
          0
        ),
      }
    );
    // Automatically remove the job from the queue after it has been processed
    msg.ack();
  }
}
