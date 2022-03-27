import { Router } from "express";
import Order from "../models/order";

const router = Router();

router.get("/api/orders", async (req, res, next) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate("ticket");

  res.send(orders);
});

export { router as indexOrderRouter };
