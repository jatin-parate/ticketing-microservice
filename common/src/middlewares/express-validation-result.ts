import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error";

export const expressValidationResultMiddleware: RequestHandler = (
  req,
  _res,
  next
) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    throw new RequestValidationError(result.array());
  }

  next();
};
