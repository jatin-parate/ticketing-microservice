import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}
export const currentUserMiddleware: RequestHandler = (req, res, next) => {
  if (!req.session?.jwt) {
    req.currentUser = undefined;
    next();
    return;
  }

  try {
    const payload = jwt.verify(
      req.session!.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;

    req.currentUser = payload;
  } catch (err) {}
  next();
};
