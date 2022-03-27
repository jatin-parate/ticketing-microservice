import {
  BasePublisher,
  OrderCancelledEvent,
  Subjects,
} from "@jatin.parate/common";

export class OrderCancelledPublisher extends BasePublisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
