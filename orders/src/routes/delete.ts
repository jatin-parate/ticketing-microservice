import {
  NotFoundError,
  OrderStatus,
  requireAuth,
  UnauthorizedError,
} from "@jatin.parate/common";
import { Request, Router } from "express";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import Order from "../models/order";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (
    { params: { orderId }, currentUser }: Request<{ orderId: string }>,
    res
  ) => {
    const order = await Order.findById(orderId).populate('ticket').exec();

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== currentUser!.id) {
      throw new UnauthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();
    
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id.toString(),
      ticket: {
        id: order.ticket.id.toString(),
      },
      version: order.version,
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
