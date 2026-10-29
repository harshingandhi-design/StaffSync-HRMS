import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide announcement title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide announcement content'],
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    category: {
      type: String,
      enum: ['General', 'Holiday', 'Townhall', 'Policy', 'Celebration', 'Operations'],
      default: 'General',
    },
    targetAudience: {
      type: String,
      default: 'All', // 'All', or specific department like 'Engineering'
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema);
