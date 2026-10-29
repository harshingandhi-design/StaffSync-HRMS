import { Router } from 'express';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Manager from '../models/Manager.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// GET /api/employees - Get all employees (HR, Manager, Employee directory)
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { department, search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate('manager', 'name email role')
        .populate('user', 'name avatar role isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Employee.countDocuments(query),
    ]);

    res.json({
      success: true,
      employees,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)) || 1,
    });
  })
);

// GET /api/employees/team - Manager views team members
router.get(
  '/team',
  protect,
  authorize('manager', 'hr', 'admin'),
  asyncHandler(async (req, res) => {
    const query = { manager: req.user._id };
    const team = await Employee.find(query)
      .populate('user', 'name avatar email isActive')
      .sort({ firstName: 1 });

    res.json({
      success: true,
      team,
      count: team.length,
    });
  })
);

// GET /api/employees/:id - Get single employee details
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id)
      .populate('manager', 'name email role')
      .populate('user', 'name email role avatar isActive');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      employee,
    });
  })
);

// POST /api/employees - HR creates new employee and user account
router.post(
  '/',
  protect,
  authorize('hr', 'admin'),
  asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      password = 'StaffSync@123',
      department,
      designation,
      salary,
      phone,
      manager,
      role = 'employee',
      dateOfJoining,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    const count = await Employee.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(4, '0')}`;

    const user = await User.create({
      name: `${firstName} ${lastName}`.trim(),
      email,
      password,
      role,
    });

    const employee = await Employee.create({
      employeeId,
      user: user._id,
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      salary: salary ? Number(salary) : 60000,
      manager: manager || null,
      dateOfJoining: dateOfJoining || Date.now(),
    });

    user.employeeProfile = employee._id;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      employee,
    });
  })
);

// PUT /api/employees/:id - HR updates employee details
router.put(
  '/:id',
  protect,
  authorize('hr', 'admin'),
  asyncHandler(async (req, res) => {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('manager', 'name email');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      message: 'Employee details updated.',
      employee,
    });
  })
);

// DELETE /api/employees/:id - HR deactivates employee
router.delete(
  '/:id',
  protect,
  authorize('hr', 'admin'),
  asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.status = 'Terminated';
    await employee.save();

    await User.findByIdAndUpdate(employee.user, { isActive: false });

    res.json({
      success: true,
      message: 'Employee deactivated successfully.',
    });
  })
);

export default router;
