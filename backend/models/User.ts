
import mongoose, { Schema } from "mongoose";

// Define the User data types
interface IUser {
  UserID: number;
  username: string;
  password: string;
  Name: string;
  email: string;
}

// Create the MongoDB schema
const UserSchema = new Schema<IUser>({
  UserID: Number,
  username: String,
  password: String,
  Name: String,
  email: String,
});

// Create the User model
const User = mongoose.model<IUser>(
  "User",
  UserSchema,
  "User"
);

export default User;
