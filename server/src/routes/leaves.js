import { Router } from 'express';
import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// GET /api/leaves/my-leaves - Get current employee's leaves and balance
router.get(
  '/my-leaves',
  protect,
  asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeProfile?._id || req.user.employeeProfile;
    if (!employeeId) {
      return res.status(400).json({ message: 'No employee profile linked to this account.' });
    }

    const employee = await Employee.findById(employeeId);
    const leaves = await Leave.find({ employee: employeeId })
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      leaveBalance: employee?.leaveBalance || { casual: 12, sick: 8, annual: 15 },
      leaves,
    });
  })
);

// POST /api/leaves/apply - Employee applies for leave
router.post(
  '/apply',
  protect,
  asyncHandler(async (req, res) => {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user.employeeProfile?._id || req.user.employeeProfile;

    if (!employeeId) {
      return res.status(400).json({ message: 'No employee profile linked.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be prior to start date.' });
    }

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found.' });
    }

    const typeKey = leaveType.toLowerCase();
    if (employee.leaveBalance && employee.leaveBalance[typeKey] !== undefined) {
      if (employee.leaveBalance[typeKey] < diffDays) {
        return res.status(400).json({
          message: `Insufficient ${leaveType} leave balance. Available: ${employee.leaveBalance[typeKey]} days, requested: ${diffDays} days.`,
        });
      }
    }

    const leave = await Leave.create({
      employee: employeeId,
      user: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays: diffDays,
      reason,
      status: 'Pending',
    });

    // Notify manager if assigned
    if (employee.manager) {
      await Notification.create({
        recipient: employee.manager,
        title: 'New Leave Request',
        message: `${employee.firstName} ${employee.lastName} has applied for ${diffDays} day(s) of ${leaveType} leave.`,
        type: 'leave',
        link: '/leaves',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully for review.',
      leave,
    });
  })
);

// GET /api/leaves/pending - Manager views team's pending, HR views all pending
router.get(
  '/pending',
  protect,
  authorize('manager', 'hr', 'admin'),
  asyncHandler(async (req, res) => {
    let query = { status: 'Pending' };

    if (req.user.role === 'manager') {
      const team = await Employee.find({ manager: req.user._id });
      const teamIds = team.map((t) => t._id);
      query.employee = { $in: teamIds };
    }

    const pendingLeaves = await Leave.find(query)
      .populate('employee', 'firstName lastName email department designation employeeId leaveBalance')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingLeaves.length,
      leaves: pendingLeaves,
    });
  })
);

// GET /api/leaves/all - HR views all leaves across company
router.get(
  '/all',
  protect,
  authorize('hr', 'admin'),
  asyncHandler(async (req, res) => {
    const { status, leaveType } = req.query;
    const query = {};

    if (status && status !== 'All') query.status = status;
    if (leaveType && leaveType !== 'All') query.leaveType = leaveType;

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName email department designation employeeId')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leaves.length,
      leaves,
    });
  })
);

// PUT /api/leaves/:id/status - Approve or reject leave
router.put(
  '/:id/status',
  protect,
  authorize('manager', 'hr', 'admin'),
  asyncHandler(async (req, res) => {
    const { status, reviewComments } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'Approved' or 'Rejected'." });
    }

    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewComments = reviewComments || (status === 'Approved' ? 'Approved by supervisor.' : 'Declined.');
    leave.reviewedAt = new Date();
    await leave.save();

    // If approved, deduct leave balance
    if (status === 'Approved') {
      const emp = await Employee.findById(leave.employee._id);
      const typeKey = leave.leaveType.toLowerCase();
      if (emp && emp.leaveBalance && emp.leaveBalance[typeKey] !== undefined) {
        emp.leaveBalance[typeKey] = Math.max(0, emp.leaveBalance[typeKey] - leave.totalDays);
        await emp.save();
      }
    }

    // Notify applicant
    await Notification.create({
      recipient: leave.user,
      title: `Leave Request ${status}`,
      message: `Your ${leave.leaveType} leave request for ${leave.totalDays} day(s) was ${status.toLowerCase()} by ${req.user.name}.`,
      type: 'leave',
      link: '/leaves',
    });

    res.json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}.`,
      leave,
    });
  })
);

export default router;
