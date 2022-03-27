import { Router, Request, Response } from "express";
import { startSession } from "mongoose";
import {
  requireAuth,
  expressValidationResultMiddleware,
} from "@jatin.parate/common";
import { body } from "express-validator";
import Ticket, { TicketDocument } from "../models/ticket";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: -1 })
      .withMessage("Price must be positive decimal value"),
  ],
  expressValidationResultMiddleware,
  async (req: Request, res: Response) => {
    const ticket = Ticket.build({
      ...req.body,
      userId: req.currentUser!.id,
    });

    const session = await startSession();

    await ticket.save({ session });

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    session.endSession().catch((err) => {
      console.error(err);
    });

    res.status(201).json(ticket);
  }
);

export { router as createTicketRouter };
