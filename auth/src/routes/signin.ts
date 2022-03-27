import { Router, Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import {
  BadRequestError,
  expressValidationResultMiddleware,
} from "@jatin.parate/common";
import userModel from "../models/user";
import { Password } from "../services/password";

const router = Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  expressValidationResultMiddleware,
  async (
    req: Request<{}, any, { email: string; password: string }>,
    res: Response<any>
  ) => {
    const { email, password } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (
      !existingUser ||
      !(await Password.compare(existingUser.password, password))
    ) {
      throw new BadRequestError("Invalid credentials!");
    }

    // Generate JWT
    const userJwt = jwt.sign(existingUser.toJSON(), process.env.JWT_KEY!);

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };
    res.status(200).send(existingUser);
  }
);

export { router as signInRouter };
