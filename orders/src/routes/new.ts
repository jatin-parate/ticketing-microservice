import {
  BadRequestError,
  expressValidationResultMiddleware,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from "@jatin.parate/common";
import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { Types } from "mongoose";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import Order from "../models/order";
import Ticket from "../models/Ticket";
import { natsWrapper } from "../nats-wrapper";

const router = Router();
const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .withMessage("TicketId is required")
      .custom((input: string) => Types.ObjectId.isValid(input)),
  ],
  expressValidationResultMiddleware,
  async (
    { body: { ticketId }, currentUser }: Request<{}, {}, { ticketId: string }>,
    res: Response
  ) => {
    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure the ticket exists and is not reserved
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved!");
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = Order.build({
      userId: currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    // Publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
      version: order.version,
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
