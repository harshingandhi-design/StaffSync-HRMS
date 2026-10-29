import { Router } from 'express';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { generateToken } from '../utils/token.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// POST /api/auth/register - Register a new user & employee
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password, role = 'employee', department = 'Engineering', designation = 'Associate' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    const [firstName, ...lastParts] = name.split(' ');
    const lastName = lastParts.join(' ') || 'Employee';

    // Generate unique employee ID
    const count = await Employee.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(4, '0')}`;

    const employee = await Employee.create({
      employeeId,
      user: user._id,
      firstName,
      lastName,
      email: user.email,
      department,
      designation,
    });

    user.employeeProfile = employee._id;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeProfile: employee,
      },
    });
  })
);

// POST /api/auth/login - Authenticate user & get token
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email }).select('+password').populate('employeeProfile');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact HR.' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        employeeProfile: user.employeeProfile,
      },
    });
  })
);

// GET /api/auth/me - Get current authenticated user
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('employeeProfile');
    res.json({
      success: true,
      user,
    });
  })
);

// PUT /api/auth/profile - Update personal profile details
router.put(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const { phone, address, emergencyContact, avatar } = req.body;

    if (avatar !== undefined) {
      req.user.avatar = avatar;
      await req.user.save();
    }

    if (req.user.employeeProfile) {
      const employee = await Employee.findById(req.user.employeeProfile._id || req.user.employeeProfile);
      if (employee) {
        if (phone !== undefined) employee.phone = phone;
        if (address) employee.address = { ...employee.address, ...address };
        if (emergencyContact) employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
        await employee.save();
      }
    }

    const updatedUser = await User.findById(req.user._id).populate('employeeProfile');

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  })
);

export default router;
