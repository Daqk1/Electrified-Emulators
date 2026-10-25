
import mongoose, { Schema } from "mongoose";

// Define the User data types
interface IUser {
  _id: number;
  username: string;
  password: string;
  Name: string;
  email: string;
  course_id: number;
}

// Create the MongoDB schema
const UserSchema = new Schema<IUser>({
  _id: Number,
  username: String,
  password: String,
  Name: String,
  email: String,
  course_id: Number
});

// Create the User model
const User = mongoose.model<IUser>(
  "User",
  UserSchema,
  "User"
);

export default User;
