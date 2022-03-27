import { Model, Document, model, Schema, Types } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

interface TicketDocType extends TicketAttrs {
  id: Types.ObjectId;
  version: number;
}

export interface TicketDocument
  extends Omit<Document<Types.ObjectId, {}, TicketDocType>, "__v">,
    TicketAttrs,
    Pick<TicketDocType, "version"> {}

interface TicketModel extends Model<TicketDocument> {
  build(ticketAttrs: TicketAttrs): TicketDocument;
}

const userSchema = new Schema<TicketDocument, TicketModel>(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
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

userSchema.plugin(updateIfCurrentPlugin);

userSchema.statics.build = (ticketAttrs: TicketAttrs) =>
  new Ticket(ticketAttrs);

const Ticket: TicketModel = model<TicketDocument, TicketModel>(
  "ticket",
  userSchema,
  "tickets"
);

export default Ticket;
