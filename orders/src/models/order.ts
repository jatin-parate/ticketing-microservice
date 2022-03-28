import { Document, model, Model, Schema, Types } from "mongoose";
import { OrderStatus } from "@jatin.parate/common";
import { TicketDocument } from "./Ticket";
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDocument;
}

interface OrderDocType extends OrderAttrs {
  id: Types.ObjectId;
  version: number;
}

export interface OrderDocument
  extends Omit<Document<Types.ObjectId, {}, OrderDocType>, "__v">,
    OrderAttrs, Pick<OrderDocType, 'version'> {}

interface OrderModel extends Model<OrderDocument> {
  build(orderAttrs: OrderAttrs): OrderDocument;
}

const orderSchema = new Schema<OrderDocument, OrderModel>(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: Schema.Types.Date,
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "ticket",
    },
  },
  {
    timestamps: false,
    versionKey: 'version',
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (orderAttrs: OrderAttrs) => new Order(orderAttrs);

const Order: OrderModel = model<OrderDocument, OrderModel>(
  "order",
  orderSchema,
  "orders"
);

export default Order;
