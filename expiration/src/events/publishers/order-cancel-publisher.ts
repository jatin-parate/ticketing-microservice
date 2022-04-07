import { BasePublisher, OrderCancelledEvent, Subjects } from "@jatin.parate/common";

export class OrderCancelPublisher extends BasePublisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}