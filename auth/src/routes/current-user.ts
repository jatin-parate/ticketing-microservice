import { Router } from "express";
import jwt from "jsonwebtoken";
import { currentUserMiddleware, requireAuth } from "@jatin.parate/common";

const router = Router();

router.get(
  "/api/users/currentuser",
  currentUserMiddleware,
  requireAuth,
  (req, res) => {
    res.send({ currentUser: req.currentUser || null });
  }
);

export { router as currentUserRouter };
