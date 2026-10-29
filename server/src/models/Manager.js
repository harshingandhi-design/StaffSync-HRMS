import mongoose from 'mongoose';

const managerSchema = new mongoose.Schema(
  {
    managerId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
    projectScope: {
      type: String,
      default: 'Core Platform Engineering',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Manager', managerSchema);
