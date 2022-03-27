import {
  expressValidationResultMiddleware,
  NotFoundError,
  requireAuth,
  UnauthorizedError,
} from "@jatin.parate/common";
import { Request, Response, Router } from "express";
import { body, param } from "express-validator";
import { startSession, Types } from "mongoose";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import Ticket, { TicketDocument } from "../models/ticket";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    param("id").isMongoId().withMessage("Invalid id"),
    body("title").notEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: -1 })
      .withMessage("Price must be positive decimal value"),
  ],
  expressValidationResultMiddleware,
  async (req: Request<{ id: string }>, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }

    const session = await startSession();
    Object.assign(ticket, req.body);
    await ticket.save({ session });

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket!);
  }
);

export { router as updateTicketRouter };
