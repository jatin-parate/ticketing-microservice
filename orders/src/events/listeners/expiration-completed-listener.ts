import {
  ExpirationCompleteEvent,
  Listener,
  Subjects,
  OrderStatus,
} from "@jatin.parate/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-names";
import Order from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;
  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();
    new OrderCancelledPublisher(this.client).publish({
      id: order.id.toHexString(),
      version: order.version,
      ticket: {
        id: order.ticket.id.toHexString(),
      },
    });
    msg.ack();
  }
}
