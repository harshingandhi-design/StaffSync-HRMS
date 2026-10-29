import { Router } from 'express';
import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// GET /api/announcements - Get all active company announcements
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const announcements = await Announcement.find()
      .populate('postedBy', 'name role avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: announcements.length,
      announcements,
    });
  })
);

// POST /api/announcements - HR posts new announcement
router.post(
  '/',
  protect,
  authorize('hr', 'admin'),
  asyncHandler(async (req, res) => {
    const { title, content, priority = 'Normal', category = 'General', targetAudience = 'All' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      priority,
      category,
      targetAudience,
      postedBy: req.user._id,
    });

    // Notify all active users
    const users = await User.find({ isActive: true });
    const notifications = users.map((u) => ({
      recipient: u._id,
      title: `Company Announcement: ${title}`,
      message: `${req.user.name} posted a new ${priority.toLowerCase()} announcement: ${title}`,
      type: 'announcement',
      link: '/announcements',
    }));
    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully and notified to team.',
      announcement,
    });
  })
);

// DELETE /api/announcements/:id - HR deletes announcement
router.delete(
  '/:id',
  protect,
  authorize('hr', 'admin'),
  asyncHandler(async (req, res) => {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully.',
    });
  })
);

export default router;
