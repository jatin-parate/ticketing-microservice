import { connect } from "mongoose";
import app from "./app";

const main = async () => {
  if (!process.env.JWT_KEY) {
    throw Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw Error("MONGO_URI must be defined");
  }

  await connect(process.env.MONGO_URI!);

  app.listen(3000, () => {
    console.log("Server started on port 3000");
  });
};

main();
