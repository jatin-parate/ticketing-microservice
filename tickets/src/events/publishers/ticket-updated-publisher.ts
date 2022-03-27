import { BasePublisher, Subjects, TicketUpdatedEvent } from '@jatin.parate/common';

export class TicketUpdatedPublisher extends BasePublisher<TicketUpdatedEvent> {
  readonly subject:Subjects.TicketUpdated = Subjects.TicketUpdated;
}
