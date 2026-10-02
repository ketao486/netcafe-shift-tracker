import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPayslip {
  userId: Types.ObjectId;
  staffName: string;
  staffCode: string;
  role: string;
  totalHours: number;
  standardHours: number;
  nightHours: number;
  otHours: number;
  hourlyRate: number;
  nightRate: number;
  standardSalary: number;
  nightSalary: number;
  otSalary: number;
  baseSalary: number;
  allowance: number;
  attendanceBonus: number;
  latePenalty: number;
  cashShortagePenalty: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  note?: string;
  isPaid: boolean;
  paidAt?: Date;
}

export interface IPayrollCycle extends Document {
  code: string; // e.g. "PAYROLL-2026-10-P1"
  title: string; // e.g. "Bảng lương Tháng 10/2026 (01/10 - 15/10)"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'DRAFT' | 'LOCKED' | 'PAID';
  totalAmount: number;
  totalStaff: number;
  payslips: IPayslip[];
  lockedBy?: Types.ObjectId;
  lockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayslipSchema = new Schema<IPayslip>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    staffName: { type: String, required: true },
    staffCode: { type: String, required: true },
    role: { type: String, required: true },
    totalHours: { type: Number, default: 0 },
    standardHours: { type: Number, default: 0 },
    nightHours: { type: Number, default: 0 },
    otHours: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    nightRate: { type: Number, default: 0 },
    standardSalary: { type: Number, default: 0 },
    nightSalary: { type: Number, default: 0 },
    otSalary: { type: Number, default: 0 },
    baseSalary: { type: Number, default: 0 },
    allowance: { type: Number, default: 0 },
    attendanceBonus: { type: Number, default: 0 },
    latePenalty: { type: Number, default: 0 },
    cashShortagePenalty: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    note: { type: String, default: '' },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  { _id: true }
);

const PayrollCycleSchema = new Schema<IPayrollCycle>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'LOCKED', 'PAID'],
      default: 'DRAFT',
    },
    totalAmount: { type: Number, default: 0 },
    totalStaff: { type: Number, default: 0 },
    payslips: [PayslipSchema],
    lockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lockedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const PayrollCycle: Model<IPayrollCycle> =
  mongoose.models.PayrollCycle ||
  mongoose.model<IPayrollCycle>('PayrollCycle', PayrollCycleSchema);
