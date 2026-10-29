import mongoose from 'mongoose';

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide training title'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
      default: 'StaffSync Talent Academy',
    },
    department: {
      type: String,
      default: 'All',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming',
    },
    maxSeats: {
      type: Number,
      default: 30,
    },
    enrolledEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
    skillsCovered: [
      {
        type: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Training', trainingSchema);
