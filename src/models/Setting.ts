import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  wifiSSID: string;
  nightStartHour: number; // e.g. 22
  nightEndHour: number;   // e.g. 6
  nightMultiplier: number; // e.g. 1.3
  latePenaltyPerMinute: number; // e.g. 2000 VND
  lateGraceMinutes: number; // e.g. 10 mins
  fnbMenu: {
    id: string;
    name: string;
    category: string;
    unit: string;
    defaultPrice: number;
    initialStock: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    storeName: { type: String, default: 'CYBER GAME CYBERSPACE PRO' },
    storeAddress: { type: String, default: '123 Đường Công Nghệ, Quận 1, TP.HCM' },
    storePhone: { type: String, default: '0901 234 567' },
    wifiSSID: { type: String, default: 'CYBERSHOP_STAFF_5G' },
    nightStartHour: { type: Number, default: 22 },
    nightEndHour: { type: Number, default: 6 },
    nightMultiplier: { type: Number, default: 1.3 },
    latePenaltyPerMinute: { type: Number, default: 2000 },
    lateGraceMinutes: { type: Number, default: 10 },
    fnbMenu: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        category: { type: String, default: 'Nước uống' },
        unit: { type: String, default: 'Chai' },
        defaultPrice: { type: Number, default: 15000 },
        initialStock: { type: Number, default: 24 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);
