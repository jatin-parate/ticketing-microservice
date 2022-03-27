import { ErrorRequestHandler, Response } from "express";
import { CustomError } from "../errors/custom-error";
import { DatabaseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req,
  res: Response<{ errors: { message: string; field?: string }[] }>,
  _next
) => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ errors: err.serializeErrors() });
    return;
  }

  res.status(400).send({
    errors: [
      {
        message: err.message,
      },
    ],
  });
};
