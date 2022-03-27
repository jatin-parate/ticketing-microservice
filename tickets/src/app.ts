import express, { json } from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import {
  NotFoundError,
  errorHandler,
  currentUserMiddleware,
} from "@jatin.parate/common";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";

const app = express();
app.set("trust proxy", true);

app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(indexTicketRouter);
app.use(showTicketRouter);

app.use(currentUserMiddleware);

app.use(createTicketRouter);
app.use(updateTicketRouter);

app.use("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export default app;
