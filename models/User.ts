import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String },
    passwordHash: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    settings: {
      coverTitle: { type: String, default: "My Autobiography" },
      fontFamily: { type: String, default: "Inter" },
      favoriteQuotes: { type: [String], default: [] }
    }
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;
