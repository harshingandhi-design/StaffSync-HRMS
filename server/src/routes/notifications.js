import { Router } from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// GET /api/notifications - List current user notifications
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  })
);

// PUT /api/notifications/:id/read - Mark one as read
router.put(
  '/:id/read',
  protect,
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    res.json({ success: true, notification });
  })
);

// PUT /api/notifications/read-all - Mark all as read
router.put(
  '/read-all',
  protect,
  asyncHandler(async (req, res) => {
    await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  })
);

export default router;
