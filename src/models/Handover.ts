import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IHandoverItem {
  itemId: string;
  itemName: string;
  unit: string;
  initialQty: number; // Đầu ca
  importQty: number;  // Nhập trong ca
  soldQty: number;    // Đã bán
  expectedQty: number;// initialQty + importQty - soldQty
  actualQty: number;  // Kiểm đếm thực tế
  difference: number; // actualQty - expectedQty
}

export interface IHandoverExpense {
  amount: number;
  reason: string;
  time?: string;
}

export interface IIncidentLog {
  machineNumber: string;
  issue: string;
  status: 'PENDING' | 'RESOLVED';
  note: string;
}

export interface ICustomerLostItem {
  itemDescription: string;
  seatOrArea: string;
  status: 'HOLDING' | 'RETURNED';
}

export interface IHandover extends Document {
  date: string; // YYYY-MM-DD
  shiftName: string;
  fromUserId: Types.ObjectId;
  toUserId?: Types.ObjectId;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'DISPUTED';
  cashAudit: {
    openingCash: number;
    netBillingRevenue: number;
    fnbRevenue: number;
    expenses: IHandoverExpense[];
    totalExpenses: number;
    totalExpectedCash: number;
    actualCash: number;
    difference: number;
    cashBreakdown?: {
      k500: number;
      k200: number;
      k100: number;
      k50: number;
      k20: number;
      k10: number;
      k5: number;
      k2: number;
      k1: number;
    };
  };
  stockAudit: IHandoverItem[];
  incidentLogs: IIncidentLog[];
  customerLostItems: ICustomerLostItem[];
  generalNotes?: string;
  confirmedAt?: Date;
  disputeReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HandoverSchema = new Schema<IHandover>(
  {
    date: { type: String, required: true },
    shiftName: { type: String, required: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['PENDING_CONFIRMATION', 'CONFIRMED', 'DISPUTED'],
      default: 'PENDING_CONFIRMATION',
    },
    cashAudit: {
      openingCash: { type: Number, default: 0 },
      netBillingRevenue: { type: Number, default: 0 },
      fnbRevenue: { type: Number, default: 0 },
      expenses: [
        {
          amount: { type: Number, required: true },
          reason: { type: String, required: true },
          time: { type: String },
        },
      ],
      totalExpenses: { type: Number, default: 0 },
      totalExpectedCash: { type: Number, default: 0 },
      actualCash: { type: Number, default: 0 },
      difference: { type: Number, default: 0 },
      cashBreakdown: {
        k500: { type: Number, default: 0 },
        k200: { type: Number, default: 0 },
        k100: { type: Number, default: 0 },
        k50: { type: Number, default: 0 },
        k20: { type: Number, default: 0 },
        k10: { type: Number, default: 0 },
        k5: { type: Number, default: 0 },
        k2: { type: Number, default: 0 },
        k1: { type: Number, default: 0 },
      },
    },
    stockAudit: [
      {
        itemId: { type: String, required: true },
        itemName: { type: String, required: true },
        unit: { type: String, default: 'Chai' },
        initialQty: { type: Number, default: 0 },
        importQty: { type: Number, default: 0 },
        soldQty: { type: Number, default: 0 },
        expectedQty: { type: Number, default: 0 },
        actualQty: { type: Number, default: 0 },
        difference: { type: Number, default: 0 },
      },
    ],
    incidentLogs: [
      {
        machineNumber: { type: String, required: true },
        issue: { type: String, required: true },
        status: { type: String, enum: ['PENDING', 'RESOLVED'], default: 'PENDING' },
        note: { type: String, default: '' },
      },
    ],
    customerLostItems: [
      {
        itemDescription: { type: String, required: true },
        seatOrArea: { type: String, required: true },
        status: { type: String, enum: ['HOLDING', 'RETURNED'], default: 'HOLDING' },
      },
    ],
    generalNotes: { type: String, default: '' },
    confirmedAt: { type: Date },
    disputeReason: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Handover: Model<IHandover> =
  mongoose.models.Handover || mongoose.model<IHandover>('Handover', HandoverSchema);
