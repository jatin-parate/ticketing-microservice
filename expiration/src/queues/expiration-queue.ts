import Queue from "bull";
import { OrderCancelPublisher } from "../events/publishers/order-cancel-publisher";
import { natsWrapper } from "../nats-wrapper";

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST!,
  },
});

expirationQueue.process(async (job) => {
  // new OrderCancelPublisher(natsWrapper.client).publish({

  // })
});

export { expirationQueue };
