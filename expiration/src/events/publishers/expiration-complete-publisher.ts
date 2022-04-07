import {
  BasePublisher,
  ExpirationCompleteEvent,
  Subjects,
} from "@jatin.parate/common";

export class ExpirationPublisher extends BasePublisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
