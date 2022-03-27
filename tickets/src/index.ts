import { connect } from "mongoose";
import app from "./app";
import { natsWrapper } from "./nats-wrapper";

const main = async () => {
  if (!process.env.JWT_KEY) {
    throw Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw Error("MONGO_URI must be defined");
  }
  if (!process.env.NATS_URL) {
    throw Error("NATS_URL must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw Error("NATS_CLUSTER_ID must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw Error("NATS_CLIENT_ID must be defined");
  }

  await natsWrapper.connect(
    process.env.NATS_CLUSTER_ID,
    process.env.NATS_CLIENT_ID,
    process.env.NATS_URL
  );

  natsWrapper.client.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });
  process.on("SIGINT", () => natsWrapper.client.close());
  process.on("SIGTERM", () => natsWrapper.client.close());

  await connect(process.env.MONGO_URI!);

  app.listen(3000, () => {
    console.log("Server started on port 3000");
  });
};

main();
