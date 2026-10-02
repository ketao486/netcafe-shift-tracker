import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  code: string;
  name: string;
  phone: string;
  username: string;
  password?: string;
  pin: string;
  role: 'ADMIN' | 'CASHIER' | 'SERVICE' | 'TECH' | 'CLEANER';
  status: 'ACTIVE' | 'INACTIVE';
  hourlyRate: number;
  nightRate: number;
  baseSalary: number;
  allowance: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    pin: { type: String, default: '1234' },
    role: {
      type: String,
      enum: ['ADMIN', 'CASHIER', 'SERVICE', 'TECH', 'CLEANER'],
      default: 'CASHIER',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    hourlyRate: { type: Number, default: 25000 },
    nightRate: { type: Number, default: 35000 },
    baseSalary: { type: Number, default: 0 },
    allowance: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
