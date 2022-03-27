import {
  BasePublisher,
  OrderCreatedEvent,
  Subjects,
} from "@jatin.parate/common";

export class OrderCreatedPublisher extends BasePublisher<OrderCreatedEvent> {
  readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
