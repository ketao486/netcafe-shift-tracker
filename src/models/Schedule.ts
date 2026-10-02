import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISchedule extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  shiftType: 'CA1' | 'CA2' | 'CA3' | 'CUSTOM';
  shiftName: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  station: string;
  role: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABSENT' | 'SWAPPED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    shiftType: {
      type: String,
      enum: ['CA1', 'CA2', 'CA3', 'CUSTOM'],
      default: 'CA1',
    },
    shiftName: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    station: { type: String, default: 'Quầy Thu Ngân' },
    role: { type: String, default: 'CASHIER' },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'ABSENT', 'SWAPPED'],
      default: 'SCHEDULED',
    },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const Schedule: Model<ISchedule> =
  mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema);
