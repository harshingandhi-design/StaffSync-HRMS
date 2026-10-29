import { Router } from 'express';
import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Helper to get formatted current local date string: YYYY-MM-DD
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// GET /api/attendance/today - Get current employee's attendance status today
router.get(
  '/today',
  protect,
  asyncHandler(async (req, res) => {
    const today = getTodayString();
    const employeeId = req.user.employeeProfile?._id || req.user.employeeProfile;

    if (!employeeId) {
      return res.status(400).json({ message: 'No employee profile linked to this account.' });
    }

    const record = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    res.json({
      success: true,
      today,
      record: record || null,
      isCheckedIn: Boolean(record && record.checkIn && !record.checkOut),
      isCheckedOut: Boolean(record && record.checkOut),
    });
  })
);

// POST /api/attendance/check-in - Employee checks in
router.post(
  '/check-in',
  protect,
  asyncHandler(async (req, res) => {
    const today = getTodayString();
    const employeeId = req.user.employeeProfile?._id || req.user.employeeProfile;

    if (!employeeId) {
      return res.status(400).json({ message: 'No employee profile found for check-in.' });
    }

    let record = await Attendance.findOne({ employee: employeeId, date: today });
    if (record && record.checkIn) {
      return res.status(400).json({ message: 'You have already checked in for today.' });
    }

    const now = new Date();
    // If checkIn is after 9:30 AM local time, mark as 'Late', else 'Present'
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);

    if (!record) {
      record = await Attendance.create({
        employee: employeeId,
        user: req.user._id,
        date: today,
        checkIn: now,
        status: isLate ? 'Late' : 'Present',
        checkInLocation: req.body.location || 'StaffSync HQ / Remote Work',
      });
    } else {
      record.checkIn = now;
      record.status = isLate ? 'Late' : 'Present';
      await record.save();
    }

    res.status(201).json({
      success: true,
      message: `Checked in successfully at ${now.toLocaleTimeString()}.${isLate ? ' (Marked Late)' : ''}`,
      record,
    });
  })
);

// POST /api/attendance/check-out - Employee checks out
router.post(
  '/check-out',
  protect,
  asyncHandler(async (req, res) => {
    const today = getTodayString();
    const employeeId = req.user.employeeProfile?._id || req.user.employeeProfile;

    if (!employeeId) {
      return res.status(400).json({ message: 'No employee profile found.' });
    }

    const record = await Attendance.findOne({ employee: employeeId, date: today });
    if (!record || !record.checkIn) {
      return res.status(400).json({ message: 'You must check in before checking out.' });
    }

    if (record.checkOut) {
      return res.status(400).json({ message: 'You have already checked out for today.' });
    }

    const now = new Date();
    record.checkOut = now;

    // Calculate work hours
    const diffMs = now.getTime() - new Date(record.checkIn).getTime();
    const hoursWorked = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
    record.workHours = hoursWorked;

    // If worked less than 4.5 hours, consider Half-Day
    if (hoursWorked < 4.5 && record.status !== 'Absent') {
      record.status = 'Half-Day';
    }

    await record.save();

    res.json({
      success: true,
      message: `Checked out successfully. Total work duration: ${hoursWorked} hours.`,
      record,
    });
  })
);

// GET /api/attendance/my-history - Logged in employee history
router.get(
  '/my-history',
  protect,
  asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeProfile?._id || req.user.employeeProfile;
    const { month, year } = req.query;

    const query = { employee: employeeId };
    if (month && year) {
      const paddedMonth = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${paddedMonth}` };
    }

    const history = await Attendance.find(query).sort({ date: -1 }).limit(60);

    const stats = {
      present: history.filter((h) => h.status === 'Present').length,
      late: history.filter((h) => h.status === 'Late').length,
      halfDay: history.filter((h) => h.status === 'Half-Day').length,
      totalHours: Number(history.reduce((sum, h) => sum + (h.workHours || 0), 0).toFixed(1)),
    };

    res.json({
      success: true,
      history,
      stats,
    });
  })
);

// GET /api/attendance/team - Manager views team attendance
router.get(
  '/team',
  protect,
  authorize('manager', 'hr', 'admin'),
  asyncHandler(async (req, res) => {
    const date = req.query.date || getTodayString();
    const teamMembers = await Employee.find({ manager: req.user._id });
    const teamMemberIds = teamMembers.map((m) => m._id);

    const records = await Attendance.find({
      employee: { $in: teamMemberIds },
      date,
    }).populate('employee', 'firstName lastName email department designation');

    res.json({
      success: true,
      date,
      totalTeam: teamMembers.length,
      records,
    });
  })
);

// GET /api/attendance/all - HR views all organization attendance
router.get(
  '/all',
  protect,
  authorize('hr', 'admin'),
  asyncHandler(async (req, res) => {
    const date = req.query.date || getTodayString();
    const records = await Attendance.find({ date })
      .populate('employee', 'firstName lastName email department designation employeeId')
      .sort({ createdAt: -1 });

    const totalEmployees = await Employee.countDocuments({ status: 'Active' });
    const presentCount = records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
    const rate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

    res.json({
      success: true,
      date,
      totalEmployees,
      presentCount,
      rate,
      records,
    });
  })
);

export default router;
