import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import User from './models/User.js';
import Employee from './models/Employee.js';
import Manager from './models/Manager.js';
import Attendance from './models/Attendance.js';
import Leave from './models/Leave.js';
import Announcement from './models/Announcement.js';
import Training from './models/Training.js';
import Notification from './models/Notification.js';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync';

async function seedDatabase() {
  console.log(`[StaffSync Seeder] Connecting to MongoDB: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('[StaffSync Seeder] Connected to database.');

  // Clean existing collections
  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    Manager.deleteMany({}),
    Attendance.deleteMany({}),
    Leave.deleteMany({}),
    Announcement.deleteMany({}),
    Training.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('[StaffSync Seeder] Cleared previous database records.');

  // 1. Create HR Administrator
  const hrUser = await User.create({
    name: 'Sarah Jenkins',
    email: 'hr@staffsync.com',
    password: 'StaffSync@123',
    role: 'hr',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  });

  const hrEmployee = await Employee.create({
    employeeId: 'EMP0001',
    user: hrUser._id,
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: hrUser.email,
    phone: '+91 98765 43210',
    department: 'Human Resources',
    designation: 'Head of People & Culture',
    salary: 125000,
    dateOfJoining: new Date('2022-01-15'),
    status: 'Active',
  });
  hrUser.employeeProfile = hrEmployee._id;
  await hrUser.save();

  // 2. Create Engineering Manager
  const techManagerUser = await User.create({
    name: 'Alex Rivera',
    email: 'manager.tech@staffsync.com',
    password: 'StaffSync@123',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  });

  const techManagerEmployee = await Employee.create({
    employeeId: 'EMP0002',
    user: techManagerUser._id,
    firstName: 'Alex',
    lastName: 'Rivera',
    email: techManagerUser.email,
    phone: '+91 98765 43211',
    department: 'Engineering',
    designation: 'Engineering VP',
    salary: 140000,
    dateOfJoining: new Date('2021-06-10'),
    status: 'Active',
  });
  techManagerUser.employeeProfile = techManagerEmployee._id;
  await techManagerUser.save();

  // 3. Create Sales Manager
  const salesManagerUser = await User.create({
    name: 'Priya Sharma',
    email: 'manager.sales@staffsync.com',
    password: 'StaffSync@123',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  });

  const salesManagerEmployee = await Employee.create({
    employeeId: 'EMP0003',
    user: salesManagerUser._id,
    firstName: 'Priya',
    lastName: 'Sharma',
    email: salesManagerUser.email,
    phone: '+91 98765 43212',
    department: 'Sales',
    designation: 'Director of Global Sales',
    salary: 130000,
    dateOfJoining: new Date('2022-03-01'),
    status: 'Active',
  });
  salesManagerUser.employeeProfile = salesManagerEmployee._id;
  await salesManagerUser.save();

  // 4. Create Diverse Employees
  const employeeData = [
    {
      name: 'Rohan Mehta',
      email: 'rohan.mehta@staffsync.com',
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      salary: 85000,
      manager: techManagerUser._id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      dateOfJoining: new Date('2023-02-15'),
    },
    {
      name: 'Ananya Sen',
      email: 'ananya.sen@staffsync.com',
      department: 'Engineering',
      designation: 'Cloud DevOps Architect',
      salary: 92000,
      manager: techManagerUser._id,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      dateOfJoining: new Date('2023-04-10'),
    },
    {
      name: 'David Kim',
      email: 'david.kim@staffsync.com',
      department: 'Sales',
      designation: 'Senior Enterprise Account Executive',
      salary: 78000,
      manager: salesManagerUser._id,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      dateOfJoining: new Date('2023-08-01'),
    },
    {
      name: 'Maria Rodriguez',
      email: 'maria.rodriguez@staffsync.com',
      department: 'Marketing',
      designation: 'Growth Marketing Lead',
      salary: 74000,
      manager: hrUser._id,
      avatar: 'https://images.unsplash.com/photo-1534751516642-a171ef2ad0ab?w=200&auto=format&fit=crop&q=80',
      dateOfJoining: new Date('2023-09-15'),
    },
    {
      name: 'Aarav Patel',
      email: 'aarav.patel@staffsync.com',
      department: 'Design',
      designation: 'Product Experience Designer',
      salary: 76000,
      manager: techManagerUser._id,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      dateOfJoining: new Date('2023-11-20'),
    },
    {
      name: 'Zoya Khan',
      email: 'zoya.khan@staffsync.com',
      department: 'Human Resources',
      designation: 'Talent Acquisition Partner',
      salary: 68000,
      manager: hrUser._id,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      dateOfJoining: new Date('2024-01-10'),
    },
  ];

  const createdEmployees = [];
  let empIdx = 4;

  for (const emp of employeeData) {
    const user = await User.create({
      name: emp.name,
      email: emp.email,
      password: 'StaffSync@123',
      role: 'employee',
      avatar: emp.avatar,
    });

    const [firstName, ...lastParts] = emp.name.split(' ');
    const lastName = lastParts.join(' ');

    const employee = await Employee.create({
      employeeId: `EMP${String(empIdx++).padStart(4, '0')}`,
      user: user._id,
      firstName,
      lastName,
      email: emp.email,
      phone: `+91 98200 ${Math.floor(10000 + Math.random() * 90000)}`,
      department: emp.department,
      designation: emp.designation,
      salary: emp.salary,
      manager: emp.manager,
      dateOfJoining: emp.dateOfJoining,
      status: 'Active',
      performanceRating: Number((3.8 + Math.random() * 1.2).toFixed(1)),
    });

    user.employeeProfile = employee._id;
    await user.save();
    createdEmployees.push(employee);
  }

  // 5. Create Manager Collection documents
  await Manager.create({
    managerId: 'MGR001',
    user: techManagerUser._id,
    department: 'Engineering',
    teamMembers: [createdEmployees[0]._id, createdEmployees[1]._id, createdEmployees[4]._id],
    projectScope: 'NextGen Cloud Architecture & Mobile App',
  });

  await Manager.create({
    managerId: 'MGR002',
    user: salesManagerUser._id,
    department: 'Sales',
    teamMembers: [createdEmployees[2]._id],
    projectScope: 'APAC & EMEA B2B Expansion',
  });

  // 6. Generate Realistic Attendance for past 10 workdays
  const allEmployees = [hrEmployee, techManagerEmployee, salesManagerEmployee, ...createdEmployees];
  const today = new Date();
  const attendanceDocs = [];

  for (let i = 0; i < 10; i++) {
    const day = new Date();
    day.setDate(today.getDate() - i);
    // Skip weekends
    if (day.getDay() === 0 || day.getDay() === 6) continue;

    const dateStr = day.toISOString().split('T')[0];

    for (const emp of allEmployees) {
      const isLate = Math.random() < 0.15;
      const checkInHour = isLate ? 10 : 9;
      const checkInMin = Math.floor(Math.random() * 30);
      const checkIn = new Date(day);
      checkIn.setHours(checkInHour, checkInMin, 0);

      const checkOut = new Date(day);
      checkOut.setHours(18, Math.floor(Math.random() * 45), 0);

      const workHours = Number(((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(1));

      attendanceDocs.push({
        employee: emp._id,
        user: emp.user,
        date: dateStr,
        checkIn,
        checkOut,
        workHours,
        status: isLate ? 'Late' : 'Present',
        checkInLocation: 'StaffSync Innovation Campus, Bangalore',
      });
    }
  }
  await Attendance.insertMany(attendanceDocs);

  // 7. Create Leaves (Pending, Approved, Rejected)
  await Leave.create({
    employee: createdEmployees[0]._id, // Rohan
    user: createdEmployees[0].user,
    leaveType: 'Annual',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    totalDays: 4,
    reason: 'Family vacation and attending cousin wedding ceremony.',
    status: 'Pending',
  });

  await Leave.create({
    employee: createdEmployees[1]._id, // Ananya
    user: createdEmployees[1].user,
    leaveType: 'Casual',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    totalDays: 1,
    reason: 'Personal errands and vehicle registration renewal.',
    status: 'Pending',
  });

  await Leave.create({
    employee: createdEmployees[2]._id, // David
    user: createdEmployees[2].user,
    leaveType: 'Sick',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    totalDays: 2,
    reason: 'Viral fever and medical consultation.',
    status: 'Approved',
    reviewedBy: salesManagerUser._id,
    reviewComments: 'Approved. Get well soon and submit medical certificate upon return.',
    reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  });

  // 8. Create Announcements
  await Announcement.create([
    {
      title: '🚀 StaffSync Hackathon 2026: AI & Next-Gen Workflows Announced!',
      content:
        'We are thrilled to announce our 4th Annual Global Hackathon! Join cross-functional teams to build cutting-edge automation tools. Prizes up to INR 5,00,000 and executive spotlight presentations.',
      priority: 'High',
      category: 'Celebration',
      targetAudience: 'All',
      postedBy: hrUser._id,
    },
    {
      title: '📢 Q4 Townhall & Global Strategy Briefing with Leadership',
      content:
        'All employees are invited to join the upcoming quarterly Townhall this Friday at 4:00 PM IST. We will review our record Q3 metrics, discuss product roadmaps, and host an open Q&A with our Founders.',
      priority: 'Urgent',
      category: 'Townhall',
      targetAudience: 'All',
      postedBy: hrUser._id,
    },
    {
      title: '🌴 Diwali & Winter Holiday Calendar 2026 Released',
      content:
        'The People team has published the official festive holiday schedule for all domestic and international branches. Check the holiday calendar in your Leave portal.',
      priority: 'Normal',
      category: 'Holiday',
      targetAudience: 'All',
      postedBy: hrUser._id,
    },
    {
      title: '💡 Revised Wellness & Continuous Learning Stipend Policy',
      content:
        'Starting next month, all full-time team members are eligible for an enhanced monthly wellness stipend and an annual $1,000 professional certification allowance.',
      priority: 'High',
      category: 'Policy',
      targetAudience: 'All',
      postedBy: hrUser._id,
    },
  ]);

  // 9. Create Training Programs
  await Training.create([
    {
      title: 'Cloud Native Microservices with Kubernetes & Go',
      description:
        'Master container orchestration, automated canary rollouts, service mesh, and observability using Prometheus & Grafana in enterprise cloud deployments.',
      instructor: 'Dr. Evelyn Vance (Chief Architect)',
      department: 'Engineering',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'Ongoing',
      maxSeats: 25,
      skillsCovered: ['Kubernetes', 'Docker', 'Microservices', 'Go', 'Prometheus'],
      enrolledEmployees: [createdEmployees[0]._id, createdEmployees[1]._id],
      createdBy: techManagerUser._id,
    },
    {
      title: 'Strategic B2B Value-Based Consultative Selling',
      description:
        'Learn advanced consultative sales methodologies, value-gap discovery, objection resolution, and winning multimillion enterprise software contracts.',
      instructor: 'Marcus Sterling (Global Sales Coach)',
      department: 'Sales',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      status: 'Upcoming',
      maxSeats: 20,
      skillsCovered: ['B2B Sales', 'Negotiation', 'Enterprise Pipelines', 'Closing Techniques'],
      enrolledEmployees: [createdEmployees[2]._id],
      createdBy: salesManagerUser._id,
    },
    {
      title: 'Design Systems & Accessible Human-Centered Web UI',
      description:
        'Comprehensive workshop on scalable design tokens, WCAG 2.2 AA accessibility, Figma component architectures, and micro-interactions.',
      instructor: 'Elena Rostova (Principal UX Lead)',
      department: 'Design',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      status: 'Upcoming',
      maxSeats: 15,
      skillsCovered: ['Figma', 'Design Systems', 'WCAG Accessibility', 'User Research'],
      enrolledEmployees: [createdEmployees[4]._id],
      createdBy: techManagerUser._id,
    },
    {
      title: 'Empathetic Leadership & High-Performance Team Coaching',
      description:
        'For current and aspiring managers: develop emotional intelligence, 1-on-1 coaching frameworks, psychological safety, and driving team alignment.',
      instructor: 'Sarah Jenkins (Head of People)',
      department: 'All',
      startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: 'Ongoing',
      maxSeats: 30,
      skillsCovered: ['Leadership', 'Active Listening', 'Conflict Resolution', 'Performance Review'],
      enrolledEmployees: [techManagerEmployee._id, salesManagerEmployee._id],
      createdBy: hrUser._id,
    },
  ]);

  // 10. Create Notifications
  await Notification.create([
    {
      recipient: hrUser._id,
      title: 'New Leave Request',
      message: 'Rohan Mehta has applied for 4 days of Annual leave.',
      type: 'leave',
      link: '/leaves',
    },
    {
      recipient: techManagerUser._id,
      title: 'Team Member Leave Application',
      message: 'Ananya Sen requested 1 day of Casual leave for personal errands.',
      type: 'leave',
      link: '/leaves',
    },
    {
      recipient: createdEmployees[0].user,
      title: 'Training Enrollment Confirmed',
      message: 'You have been enrolled in Cloud Native Microservices with Kubernetes.',
      type: 'training',
      link: '/trainings',
    },
  ]);

  console.log('\n[StaffSync Seeder] Database seeded successfully!');
  console.log('=====================================================');
  console.log('🔑 PRE-CONFIGURED DEMO ACCOUNTS:');
  console.log('-----------------------------------------------------');
  console.log('👑 HR Administrator:');
  console.log('   Email   : hr@staffsync.com');
  console.log('   Password: StaffSync@123');
  console.log('-----------------------------------------------------');
  console.log('💼 Engineering Manager:');
  console.log('   Email   : manager.tech@staffsync.com');
  console.log('   Password: StaffSync@123');
  console.log('-----------------------------------------------------');
  console.log('💼 Sales Manager:');
  console.log('   Email   : manager.sales@staffsync.com');
  console.log('   Password: StaffSync@123');
  console.log('-----------------------------------------------------');
  console.log('👨‍💻 Senior Engineer (Employee):');
  console.log('   Email   : rohan.mehta@staffsync.com');
  console.log('   Password: StaffSync@123');
  console.log('=====================================================\n');

  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error('[StaffSync Seeder Error]:', err);
  process.exit(1);
});
