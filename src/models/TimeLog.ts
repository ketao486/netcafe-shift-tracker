import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITimeLog extends Document {
  userId: Types.ObjectId;
  scheduleId?: Types.ObjectId;
  date: string; // YYYY-MM-DD
  checkInTime: Date;
  checkOutTime?: Date;
  checkInMethod: 'PIN' | 'WIFI' | 'ADMIN_MANUAL';
  checkInNote?: string;
  checkOutNote?: string;
  standardHours: number;
  nightHours: number; // 22:00 - 06:00
  overtimeHours: number;
  lateMinutes: number;
  earlyMinutes: number;
  totalHours: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ADJUSTED';
  adjustedBy?: Types.ObjectId;
  adjustedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimeLogSchema = new Schema<ITimeLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule' },
    date: { type: String, required: true },
    checkInTime: { type: Date, required: true, default: Date.now },
    checkOutTime: { type: Date },
    checkInMethod: {
      type: String,
      enum: ['PIN', 'WIFI', 'ADMIN_MANUAL'],
      default: 'PIN',
    },
    checkInNote: { type: String, default: '' },
    checkOutNote: { type: String, default: '' },
    standardHours: { type: Number, default: 0 },
    nightHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    lateMinutes: { type: Number, default: 0 },
    earlyMinutes: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'ADJUSTED'],
      default: 'ACTIVE',
    },
    adjustedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    adjustedReason: { type: String },
  },
  {
    timestamps: true,
  }
);

export const TimeLog: Model<ITimeLog> =
  mongoose.models.TimeLog || mongoose.model<ITimeLog>('TimeLog', TimeLogSchema);
