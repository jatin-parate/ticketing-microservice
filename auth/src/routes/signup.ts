import { Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import {
  BadRequestError,
  RequestValidationError,
  expressValidationResultMiddleware,
} from "@jatin.parate/common";
import User from "../models/user";

const router = Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  expressValidationResultMiddleware,
  async (
    req: Request<{}, any, { email: string; password: string }>,
    res: Response<any>
  ) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser != null) {
      throw new BadRequestError("Email already exists");
    }

    const user = User.build({ email, password });
    await user.save();

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };
    res.status(201).send(user);
  }
);

export { router as signUpRouter };
