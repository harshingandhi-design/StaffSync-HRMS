import { Router } from 'express';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Training from '../models/Training.js';
import Announcement from '../models/Announcement.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// GET /api/analytics/dashboard-summary - High-level metrics for HR, Manager, and Employee
router.get(
  '/dashboard-summary',
  protect,
  asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalEmployees,
      activeEmployees,
      departmentStats,
      todayAttendance,
      pendingLeaves,
      activeTrainings,
      recentAnnouncements,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'Active' }),
      Employee.aggregate([
        { $match: { status: 'Active' } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
      ]),
      Attendance.find({ date: today }),
      Leave.countDocuments({ status: 'Pending' }),
      Training.countDocuments({ status: { $in: ['Upcoming', 'Ongoing'] } }),
      Announcement.find().sort({ createdAt: -1 }).limit(3).populate('postedBy', 'name role'),
    ]);

    const presentCount = todayAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const lateCount = todayAttendance.filter((a) => a.status === 'Late').length;
    const attendanceRate = activeEmployees > 0 ? Math.round((presentCount / activeEmployees) * 100) : 0;

    res.json({
      success: true,
      metrics: {
        totalEmployees,
        activeEmployees,
        todayPresent: presentCount,
        todayLate: lateCount,
        attendanceRate,
        pendingLeaves,
        activeTrainings,
      },
      departmentDistribution: departmentStats.map((d) => ({
        department: d._id,
        count: d.count,
      })),
      recentAnnouncements,
    });
  })
);

export default router;
