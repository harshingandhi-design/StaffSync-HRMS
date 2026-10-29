import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format for easy daily unique indexing
      required: true,
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    workHours: {
      type: Number,
      default: 0, // in hours, e.g. 8.5
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half-Day', 'Absent', 'On Leave'],
      default: 'Present',
    },
    checkInLocation: {
      type: String,
      default: 'Main Campus Office',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index so one employee can have only one attendance record per calendar date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
