import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      required: true,
      enum: ['Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance', 'Design', 'Operations'],
      default: 'Engineering',
    },
    designation: {
      type: String,
      required: true,
      default: 'Software Engineer',
    },
    salary: {
      type: Number,
      default: 65000,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    leaveBalance: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 8 },
      annual: { type: Number, default: 15 },
    },
    performanceRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.2,
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Terminated', 'Resigned'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Employee', employeeSchema);
