import { Schema, Document, model, models } from "mongoose";
import bcrypt from "bcryptjs";

// ✅ 1. Extend Document for full typing (allows use of `this`)
export interface Iuser extends Document {
  name: string;
  email: string;
  role: "Freelancer" | "Client";
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  onBoarding:boolean;
  comparePassword(candidatePassword: string): Promise<boolean>; // optional but recommended
}

// ✅ 2. Define Schema
const userSchema = new Schema<Iuser>(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      match: [/.+\@.+\..+/, "Please use a valid email address"],
    },
    role: {
      type: String,
      enum: ["Freelancer", "Client"],
      required: true,
    },
    password: {
      type: String,
      required: [true, "Please provide your password"],
    },
 onBoarding:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

// ✅ 3. Pre-save hook for hashing password
userSchema.pre("save", async function (next) {
  const user = this as Iuser;

  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ✅ 4. Add instance method for password comparison

// ✅ 5. Use consistent model name: "User"
const User = models.User || model<Iuser>("User", userSchema);

export default User;
