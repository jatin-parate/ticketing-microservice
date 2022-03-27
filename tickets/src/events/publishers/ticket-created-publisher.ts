import { BasePublisher, Subjects, TicketCreatedEvent } from '@jatin.parate/common';

export class TicketCreatedPublisher extends BasePublisher<TicketCreatedEvent> {
  readonly subject:Subjects.TicketCreated = Subjects.TicketCreated;
}
