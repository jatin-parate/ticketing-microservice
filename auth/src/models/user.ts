import { Model, Document, model, Schema, Types } from "mongoose";
import { Password } from "../services/password";

interface UserAttrs {
  email: string;
  password: string;
}

export interface UserDocument
  extends Omit<Document<Types.ObjectId>, "__v">,
    UserAttrs {}

interface UserModel extends Model<UserDocument> {
  build(userAttrs: UserAttrs): UserDocument;
}

const userSchema = new Schema<UserDocument, UserModel>(
  {
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
    },
  }
);

userSchema.pre("save", async function hashPassword(done) {
  try {
    if (this.isModified("password")) {
      const hashed = await Password.toHash(this.get("password"));
      this.set("password", hashed);
    }
    done();
  } catch (err) {
    done(err as any);
  }
});
userSchema.statics.build = (userAttrs: UserAttrs) => new userModel(userAttrs);

const userModel: UserModel = model<UserDocument, UserModel>(
  "user",
  userSchema,
  "users"
);

export default userModel;
