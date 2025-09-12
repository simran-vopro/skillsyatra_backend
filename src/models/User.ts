import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  type: string;
  email: string;
  password: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  isActive: boolean;
}

const userSchema = new Schema<IUser>({
  userId: { type: String, unique: true },
  type: { type: String, required: true },
  email: { type: String, required: true, },
  password: { type: String, required: true },
  phone: { type: String, required: true, },
  firstName: String,
  lastName: String,
  address: String,
  city: String,
  isActive: { type: Boolean, default: true }
});

userSchema.index({ phone: 1, type: 1 }, { unique: true });
userSchema.index({ email: 1, type: 1 }, { unique: true })

export const User = model<IUser>('User', userSchema);
