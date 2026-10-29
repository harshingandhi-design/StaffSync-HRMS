import { Router } from 'express';
import Training from '../models/Training.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// GET /api/trainings - List training programs
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { status, department } = req.query;
    const query = {};

    if (status && status !== 'All') query.status = status;
    if (department && department !== 'All') query.department = department;

    const trainings = await Training.find(query)
      .populate('enrolledEmployees', 'firstName lastName email department employeeId')
      .populate('createdBy', 'name role')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      count: trainings.length,
      trainings,
    });
  })
);

// POST /api/trainings - HR/Manager creates new training
router.post(
  '/',
  protect,
  authorize('hr', 'manager', 'admin'),
  asyncHandler(async (req, res) => {
    const { title, description, instructor, department = 'All', startDate, endDate, maxSeats = 30, skillsCovered = [] } = req.body;

    const training = await Training.create({
      title,
      description,
      instructor: instructor || req.user.name,
      department,
      startDate,
      endDate,
      maxSeats,
      skillsCovered,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Training program scheduled successfully.',
      training,
    });
  })
);

// POST /api/trainings/:id/enroll - Employee enrolls in training
router.post(
  '/:id/enroll',
  protect,
  asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeProfile?._id || req.user.employeeProfile;
    if (!employeeId) {
      return res.status(400).json({ message: 'No employee profile linked.' });
    }

    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: 'Training not found.' });
    }

    if (training.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot enroll in a completed training program.' });
    }

    if (training.enrolledEmployees.some((id) => id.toString() === employeeId.toString())) {
      return res.status(400).json({ message: 'You are already enrolled in this training.' });
    }

    if (training.enrolledEmployees.length >= training.maxSeats) {
      return res.status(400).json({ message: 'This training session is at full capacity.' });
    }

    training.enrolledEmployees.push(employeeId);
    await training.save();

    res.json({
      success: true,
      message: 'Enrolled successfully in training program.',
      training,
    });
  })
);

// PUT /api/trainings/:id - Update training status
router.put(
  '/:id',
  protect,
  authorize('hr', 'manager', 'admin'),
  asyncHandler(async (req, res) => {
    const training = await Training.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!training) {
      return res.status(404).json({ message: 'Training not found.' });
    }

    res.json({
      success: true,
      message: 'Training program updated.',
      training,
    });
  })
);

export default router;
