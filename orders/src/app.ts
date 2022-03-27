import express, { json } from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import {
  NotFoundError,
  errorHandler,
  currentUserMiddleware,
} from "@jatin.parate/common";
import { deleteOrderRouter } from "./routes/delete";
import { indexOrderRouter } from "./routes/index";
import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";

const app = express();
app.set("trust proxy", true);

app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUserMiddleware);

app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);

app.use("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export default app;
