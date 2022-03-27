import { Stan } from "node-nats-streaming";
import util from "util";

import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class BasePublisher<T extends Event> {
  abstract subject: T["subject"];

  constructor(private client: Stan) {
  }

  async publish(data: T["data"]) {
    return await new Promise<string>((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err, guid) => {
        if (err) {
          return reject(err);
        }

        resolve(guid);
      });
    });
  }
}
