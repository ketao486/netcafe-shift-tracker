import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IShiftSwapRequest extends Document {
  requesterId: Types.ObjectId;
  targetUserId?: Types.ObjectId;
  type: 'SWAP' | 'LEAVE';
  requesterScheduleId: Types.ObjectId;
  targetScheduleId?: Types.ObjectId;
  reason: string;
  peerStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NA';
  managerStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  managerNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShiftSwapRequestSchema = new Schema<IShiftSwapRequest>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['SWAP', 'LEAVE'], default: 'SWAP' },
    requesterScheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule', required: true },
    targetScheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule' },
    reason: { type: String, required: true },
    peerStatus: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'NA'],
      default: 'PENDING',
    },
    managerStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    managerNote: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const ShiftSwapRequest: Model<IShiftSwapRequest> =
  mongoose.models.ShiftSwapRequest ||
  mongoose.model<IShiftSwapRequest>('ShiftSwapRequest', ShiftSwapRequestSchema);
