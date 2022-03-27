import {
  NotFoundError,
  requireAuth,
  UnauthorizedError,
} from "@jatin.parate/common";
import { Request, Router } from "express";
import Order from "../models/order";

const router = Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request<{ orderId: string }>, res, next) => {
    const order = await Order.findById(req.params.orderId).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
