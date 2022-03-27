import { Router, Request, Response } from "express";
import {
  expressValidationResultMiddleware,
  NotFoundError,
} from "@jatin.parate/common";
import { param } from "express-validator";
import Ticket from "../models/ticket";

const router = Router();

router.get(
  "/api/tickets/:id",
  [param("id").isMongoId()],
  expressValidationResultMiddleware,
  async (req: Request<{ id: string }>, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    res.json(ticket);
  }
);

export { router as showTicketRouter };
