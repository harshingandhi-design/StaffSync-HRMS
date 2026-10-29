# StaffSync - Modern Human Resource Management Solution (MERN)

**StaffSync** is a full-featured, enterprise-grade Human Resource Management System (HRMS) built on the **MERN Stack** (MongoDB, Express.js, React.js, and Node.js). It streamlines and digitizes core HR workflows with role-based access control for **HR Administrators**, **Department Managers**, and **Employees**.

---

## 🌟 Key Features by Role

### 👨‍💻 Employee Module
- **Self-Service Authentication**: Secure JWT register and login.
- **Real-Time Attendance**: Interactive 1-click Check-In / Check-Out with live timer, automatic late marking (> 9:30 AM), and monthly attendance calendar logs.
- **Leave Management**: View real-time balances for **Casual**, **Sick**, and **Annual** leaves; apply for time off; track approval status with manager comments.
- **Training & Skills**: Browse upskilling catalog and 1-click self-enroll in upcoming workshops.
- **Company Announcements**: Live bulletin board for company updates, townhalls, policies, and holiday schedules.
- **Profile Management**: Maintain residential address, phone, emergency contacts, and custom avatar.

### 💼 Manager Module
- **Manager Command Center**: Team KPIs, direct reports roster, and team health snapshot.
- **Leave Approval Queue**: Review team leave requests with 1-click **Approve** / **Reject** and personalized feedback notes.
- **Team Attendance Tracking**: Monitor daily team check-ins, work hours, and absence rates.
- **Upskilling & Training**: Assign and schedule department-specific training programs.

### 👑 HR Administrator Module
- **Executive HR Dashboard**: Organization headcount, active payroll numbers, daily attendance compliance %, and pending requests.
- **Employee Lifecycle (CRUD)**: Create new employee profiles, assign managers, update salaries, departments, designations, and archive employees.
- **Company-Wide Leave Oversight**: Review and audit all organization leave requests.
- **Priority Broadcasts**: Publish priority announcements (Normal, High, Urgent) to all or targeted departments with instant notifications.
- **Workforce Analytics & Reports**: Department distribution bars, attendance compliance stats, and print-ready executive summaries.

---

## 🔐 Security & Optimization
- **Authentication**: Stateless JSON Web Tokens (JWT) stored securely and transmitted via Bearer headers.
- **Password Security**: Salted password hashing via `bcryptjs`.
- **Role-Based Access Control (RBAC)**: Express route guards (`protect`, `authorize('hr', 'manager', 'employee')`) and client-side `ProtectedRoute` guards.
- **Database Optimization**: Compound indexing on `{ employee: 1, date: 1 }` for attendance to prevent duplicate check-ins.
- **Resilient Database Startup**: Automatic retry and degraded mode fallback to avoid container crash loops on cloud hosts.
- **Flexible CORS**: Automatically reflects valid Vercel and localhost origins.

---

## 🔑 Pre-Configured Demo Accounts (Ready to Test)

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **👑 HR Director** | `hr@staffsync.com` | `StaffSync@123` | Full HR Admin & Analytics |
| **💼 Engineering Manager** | `manager.tech@staffsync.com` | `StaffSync@123` | Team Management & Approvals |
| **💼 Sales Manager** | `manager.sales@staffsync.com` | `StaffSync@123` | Team Management & Approvals |
| **👨‍💻 Senior Engineer** | `rohan.mehta@staffsync.com` | `StaffSync@123` | Employee Self-Service |

---

## 🚀 Quick Local Setup

### 1. Install Dependencies
```bash
# In project root
npm run install:all
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Run Development Servers
```bash
npm run dev
```
- **Client**: `http://localhost:5173`
- **Server**: `http://localhost:5000`

---

## 🌐 Cloud Deployment (Render & Vercel)

### Backend (Render)
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `node src/index.js`
- **Environment Variables**:
  - `MONGO_URI`: `mongodb+srv://.../staffsync?retryWrites=true&w=majority`
  - `JWT_SECRET`: `staffsync_super_secret_jwt_key_2026`
  - `CLIENT_URL`: `*`
  - `NODE_ENV`: `production`

### Frontend (Vercel)
- **Root Directory**: `client`
- **Framework Preset**: `Vite`
- **Build & Output Settings**: Default (switches OFF)
- **Environment Variables (Config)**:
  - `VITE_API_URL`: `https://<YOUR_RENDER_URL>/api`
  - `VITE_SOCKET_URL`: `https://<YOUR_RENDER_URL>`
