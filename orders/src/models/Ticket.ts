import { OrderStatus } from "@jatin.parate/common";
import { Document, model, Model, Schema, Types } from "mongoose";
import Order from "./order";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface TicketAttrs {
  ticketId: string;
  title: string;
  price: number;
}

interface TicketDocType extends TicketAttrs {
  id: Types.ObjectId;
  version: number;
}

export interface TicketDocument
  extends Omit<Document<Types.ObjectId, {}, TicketDocType>, "__v">,
    TicketAttrs,
    Pick<TicketDocType, "version"> {
  isReserved(): Promise<boolean>;
}

interface TicketModel extends Model<TicketDocument> {
  build(ticketAttrs: TicketAttrs): TicketDocument;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDocument | null>;
}

const ticketSchema = new Schema<TicketDocument, TicketModel>(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: false,
    versionKey: "version",
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (ticketAttrs: TicketAttrs) =>
  new Ticket({
    ...ticketAttrs,
    _id: ticketAttrs.ticketId,
  });
ticketSchema.statics.findByEvent = (event: { id: string; version: number }) =>
  Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket: TicketModel = model<TicketDocument, TicketModel>(
  "ticket",
  ticketSchema,
  "tickets"
);

export default Ticket;
