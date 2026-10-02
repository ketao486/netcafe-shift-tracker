import { connectDB } from './mongodb';
import { User } from '@/models/User';
import { Schedule } from '@/models/Schedule';
import { TimeLog } from '@/models/TimeLog';
import { Handover } from '@/models/Handover';
import { Setting } from '@/models/Setting';
import { hashPassword } from './auth';
import { format, subDays, addDays } from 'date-fns';

export async function seedDatabase() {
  await connectDB();

  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return { message: 'Database already has data' };
  }

  // 1. Create Default Settings
  await Setting.create({
    storeName: 'CYBER GAME CYBERSPACE PRO',
    storeAddress: '123 Đường Công Nghệ, Phường Bến Nghé, Quận 1, TP.HCM',
    storePhone: '0901 234 567',
    wifiSSID: 'CYBERSHOP_STAFF_5G',
    nightStartHour: 22,
    nightEndHour: 6,
    nightMultiplier: 1.3,
    latePenaltyPerMinute: 2000,
    lateGraceMinutes: 10,
    fnbMenu: [
      { id: 'item_1', name: 'Sting Dâu Đỏ', category: 'Nước ngọt', unit: 'Chai', defaultPrice: 15000, initialStock: 48 },
      { id: 'item_2', name: 'Bò Húc (RedBull)', category: 'Nước tăng lực', unit: 'Lon', defaultPrice: 20000, initialStock: 36 },
      { id: 'item_3', name: 'Mì Tôm Trứng Xúc Xích', category: 'Đồ ăn', unit: 'Tô', defaultPrice: 35000, initialStock: 50 },
      { id: 'item_4', name: 'Cà Phê Muối / Đen đá', category: 'Cà phê', unit: 'Ly', defaultPrice: 25000, initialStock: 40 },
      { id: 'item_5', name: 'Thẻ Nạp Garena 50K', category: 'Thẻ game', unit: 'Thẻ', defaultPrice: 50000, initialStock: 20 },
      { id: 'item_6', name: 'Nước Khoáng Aquafina', category: 'Nước lọc', unit: 'Chai', defaultPrice: 10000, initialStock: 60 },
    ],
  });

  // 2. Create Users
  const passwordHash = hashPassword('123456');

  const admin = await User.create({
    code: 'ADMIN01',
    name: 'Quản Lý Cyber (Admin)',
    phone: '0909111222',
    username: 'admin',
    password: hashPassword('admin123'),
    pin: '9999',
    role: 'ADMIN',
    status: 'ACTIVE',
    hourlyRate: 50000,
    nightRate: 65000,
    baseSalary: 10000000,
    allowance: 1000000,
  });

  const staff1 = await User.create({
    code: 'NV001',
    name: 'Trần Văn Bảo',
    phone: '0912345601',
    username: 'bao.tran',
    password: passwordHash,
    pin: '1111',
    role: 'CASHIER',
    status: 'ACTIVE',
    hourlyRate: 28000,
    nightRate: 38000,
    baseSalary: 0,
    allowance: 200000,
  });

  const staff2 = await User.create({
    code: 'NV002',
    name: 'Lê Thị Mai Hoa',
    phone: '0912345602',
    username: 'hoa.le',
    password: passwordHash,
    pin: '2222',
    role: 'CASHIER',
    status: 'ACTIVE',
    hourlyRate: 28000,
    nightRate: 38000,
    baseSalary: 0,
    allowance: 200000,
  });

  const staff3 = await User.create({
    code: 'NV003',
    name: 'Nguyễn Văn Hùng',
    phone: '0912345603',
    username: 'hung.nguyen',
    password: passwordHash,
    pin: '3333',
    role: 'TECH',
    status: 'ACTIVE',
    hourlyRate: 35000,
    nightRate: 48000,
    baseSalary: 2000000,
    allowance: 300000,
  });

  const staff4 = await User.create({
    code: 'NV004',
    name: 'Phạm Minh Tuấn',
    phone: '0912345604',
    username: 'tuan.pham',
    password: passwordHash,
    pin: '4444',
    role: 'SERVICE',
    status: 'ACTIVE',
    hourlyRate: 25000,
    nightRate: 34000,
    baseSalary: 0,
    allowance: 150000,
  });

  const staff5 = await User.create({
    code: 'NV005',
    name: 'Võ Thị Bích',
    phone: '0912345605',
    username: 'bich.vo',
    password: passwordHash,
    pin: '5555',
    role: 'CLEANER',
    status: 'ACTIVE',
    hourlyRate: 24000,
    nightRate: 32000,
    baseSalary: 0,
    allowance: 100000,
  });

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  // 3. Create sample Schedules (Ca 1: 06-14, Ca 2: 14-22, Ca 3: 22-06)
  const sched1 = await Schedule.create({
    userId: staff1._id,
    date: todayStr,
    shiftType: 'CA1',
    shiftName: 'Ca 1 (Sáng) - 06:00 đến 14:00',
    startTime: '06:00',
    endTime: '14:00',
    station: 'Quầy Thu Ngân 1',
    role: 'CASHIER',
    status: 'IN_PROGRESS',
    notes: 'Trực quầy chính',
  });

  const sched2 = await Schedule.create({
    userId: staff4._id,
    date: todayStr,
    shiftType: 'CA1',
    shiftName: 'Ca 1 (Sáng) - 06:00 đến 14:00',
    startTime: '06:00',
    endTime: '14:00',
    station: 'Khu Máy Gaming & VIP',
    role: 'SERVICE',
    status: 'IN_PROGRESS',
    notes: 'Phục vụ nước + dọn máy',
  });

  const sched3 = await Schedule.create({
    userId: staff2._id,
    date: todayStr,
    shiftType: 'CA2',
    shiftName: 'Ca 2 (Chiều) - 14:00 đến 22:00',
    startTime: '14:00',
    endTime: '22:00',
    station: 'Quầy Thu Ngân 1',
    role: 'CASHIER',
    status: 'SCHEDULED',
    notes: 'Tiếp nhận ca chiều',
  });

  const sched4 = await Schedule.create({
    userId: staff3._id,
    date: todayStr,
    shiftType: 'CA3',
    shiftName: 'Ca 3 (Đêm) - 22:00 đến 06:00',
    startTime: '22:00',
    endTime: '06:00',
    station: 'Quầy Thu Ngân + Kỹ Thuật Đêm',
    role: 'TECH',
    status: 'SCHEDULED',
    notes: 'Kiểm tra bảo trì máy trạm',
  });

  // Yesterday schedules
  await Schedule.create({
    userId: staff1._id,
    date: yesterdayStr,
    shiftType: 'CA1',
    shiftName: 'Ca 1 (Sáng) - 06:00 đến 14:00',
    startTime: '06:00',
    endTime: '14:00',
    station: 'Quầy Thu Ngân 1',
    role: 'CASHIER',
    status: 'COMPLETED',
  });

  // 4. Sample TimeLogs
  // Yesterday's complete log for staff1
  const checkInYesterday = new Date(`${yesterdayStr}T05:58:00`);
  const checkOutYesterday = new Date(`${yesterdayStr}T14:05:00`);
  await TimeLog.create({
    userId: staff1._id,
    date: yesterdayStr,
    checkInTime: checkInYesterday,
    checkOutTime: checkOutYesterday,
    checkInMethod: 'PIN',
    standardHours: 8.12,
    nightHours: 0.03,
    overtimeHours: 0.12,
    lateMinutes: 0,
    earlyMinutes: 0,
    totalHours: 8.12,
    status: 'COMPLETED',
  });

  // Today's active log for staff1
  const checkInToday = new Date(`${todayStr}T06:05:00`);
  await TimeLog.create({
    userId: staff1._id,
    scheduleId: sched1._id,
    date: todayStr,
    checkInTime: checkInToday,
    checkInMethod: 'PIN',
    checkInNote: 'Wi-Fi Check-in quán',
    standardHours: 0,
    nightHours: 0,
    overtimeHours: 0,
    lateMinutes: 5,
    earlyMinutes: 0,
    totalHours: 0,
    status: 'ACTIVE',
  });

  // 5. Sample Handover Record (Yesterday Ca 1 -> Ca 2)
  await Handover.create({
    date: yesterdayStr,
    shiftName: 'Ca 1 (Sáng) - 06:00 đến 14:00',
    fromUserId: staff1._id,
    toUserId: staff2._id,
    status: 'CONFIRMED',
    cashAudit: {
      openingCash: 1500000,
      netBillingRevenue: 3450000,
      fnbRevenue: 1280000,
      expenses: [
        { amount: 150000, reason: 'Mua đá lạnh + túi rác', time: '09:30' },
        { amount: 80000, reason: 'Tiền sửa ổ cắm khu VIP', time: '11:15' },
      ],
      totalExpenses: 230000,
      totalExpectedCash: 6000000,
      actualCash: 6000000,
      difference: 0,
      cashBreakdown: {
        k500: 6,
        k200: 10,
        k100: 8,
        k50: 3,
        k20: 2,
        k10: 1,
        k5: 0,
        k2: 0,
        k1: 0,
      },
    },
    stockAudit: [
      { itemId: 'item_1', itemName: 'Sting Dâu Đỏ', unit: 'Chai', initialQty: 48, importQty: 0, soldQty: 12, expectedQty: 36, actualQty: 36, difference: 0 },
      { itemId: 'item_2', itemName: 'Bò Húc (RedBull)', unit: 'Lon', initialQty: 36, importQty: 0, soldQty: 8, expectedQty: 28, actualQty: 28, difference: 0 },
      { itemId: 'item_3', itemName: 'Mì Tôm Trứng Xúc Xích', unit: 'Tô', initialQty: 50, importQty: 0, soldQty: 15, expectedQty: 35, actualQty: 35, difference: 0 },
    ],
    incidentLogs: [
      { machineNumber: 'VIP-04', issue: 'Chuột Logitech bị liệt nút click phải', status: 'PENDING', note: 'Đã báo kỹ thuật Hùng chiều thay' },
    ],
    customerLostItems: [
      { itemDescription: 'Cáp sạc nhanh Type-C Baseus màu đen', seatOrArea: 'Máy số 24 (Khu Thường)', status: 'HOLDING' },
    ],
    generalNotes: 'Ca sáng đông khách nạp hội viên, phòng máy vệ sinh sạch sẽ.',
    confirmedAt: new Date(`${yesterdayStr}T14:10:00`),
  });

  return { message: 'Seeded successfully', adminId: admin._id };
}
