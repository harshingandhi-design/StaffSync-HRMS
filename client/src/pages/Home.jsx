import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (email, password) => {
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page bg-light min-vh-100 d-flex flex-column">
      {/* Top Bar */}
      <header className="navbar navbar-expand bg-white border-bottom py-3 px-4 sticky-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4" to="/">
            <span className="brand-logo-icon">
              <i className="bi bi-people-fill"></i>
            </span>
            <span>Staff<span className="text-primary">Sync</span></span>
          </Link>
          <div className="ms-auto d-flex align-items-center gap-2">
            {user ? (
              <Link className="btn btn-primary btn-sm px-3" to="/dashboard">
                Go to Dashboard ({user.role})
              </Link>
            ) : (
              <>
                <Link className="btn btn-outline-secondary btn-sm px-3" to="/login">
                  Sign In
                </Link>
                <Link className="btn btn-primary btn-sm px-3" to="/register">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section py-5 text-center bg-gradient-hero text-white">
        <div className="container py-4">
          <span className="badge bg-white text-primary px-3 py-2 rounded-pill fw-semibold mb-3 shadow-sm">
            ⚡ Modern Human Resource Management Solution
          </span>
          <h1 className="display-4 fw-bolder mb-3">
            Streamline People, Attendance & Workflows with <span className="text-warning">StaffSync</span>
          </h1>
          <p className="lead text-white-50 mx-auto mb-4 max-w-700">
            A centralized MERN platform designed for seamless collaboration between HR personnel, team managers, and employees. Automate attendance, leave requests, announcements, and training programs with enterprise-grade security.
          </p>

          {/* Quick 1-Click Demo Login Bar */}
          <div className="card bg-white text-dark shadow-lg border-0 p-3 mx-auto max-w-850 rounded-4 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-bold text-uppercase text-muted">
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
                1-Click Instant Demo Login:
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle">
                Pre-Seeded & Ready
              </span>
            </div>
            <div className="row g-2">
              <div className="col-12 col-md-4">
                <button
                  className="btn btn-outline-primary w-100 text-start p-2 rounded-3 h-100"
                  onClick={() => handleQuickDemoLogin('hr@staffsync.com', 'StaffSync@123')}
                >
                  <div className="fw-bold small d-flex justify-content-between align-items-center">
                    <span>👑 HR Director</span>
                    <i className="bi bi-arrow-right-short"></i>
                  </div>
                  <div className="text-muted text-xs">hr@staffsync.com</div>
                </button>
              </div>
              <div className="col-12 col-md-4">
                <button
                  className="btn btn-outline-indigo w-100 text-start p-2 rounded-3 h-100"
                  onClick={() => handleQuickDemoLogin('manager.tech@staffsync.com', 'StaffSync@123')}
                >
                  <div className="fw-bold small d-flex justify-content-between align-items-center">
                    <span>💼 Tech Manager</span>
                    <i className="bi bi-arrow-right-short"></i>
                  </div>
                  <div className="text-muted text-xs">manager.tech@staffsync.com</div>
                </button>
              </div>
              <div className="col-12 col-md-4">
                <button
                  className="btn btn-outline-success w-100 text-start p-2 rounded-3 h-100"
                  onClick={() => handleQuickDemoLogin('rohan.mehta@staffsync.com', 'StaffSync@123')}
                >
                  <div className="fw-bold small d-flex justify-content-between align-items-center">
                    <span>👨‍💻 Senior Engineer</span>
                    <i className="bi bi-arrow-right-short"></i>
                  </div>
                  <div className="text-muted text-xs">rohan.mehta@staffsync.com</div>
                </button>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="btn btn-warning fw-bold px-4 py-2 rounded-pill shadow">
              Open Sign In Portal <i className="bi bi-box-arrow-in-right ms-1"></i>
            </Link>
            <Link to="/register" className="btn btn-outline-light fw-bold px-4 py-2 rounded-pill">
              Register New Employee
            </Link>
          </div>
        </div>
      </section>

      {/* Core Modules Feature Grid */}
      <section className="py-5 bg-white">
        <div className="container py-3">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small letter-spacing">Built for Every Role</span>
            <h2 className="fw-bold mt-1">Core Modules & Capabilities</h2>
            <p className="text-muted max-w-600 mx-auto">
              StaffSync gives HR, Managers, and Employees dedicated views tailored to their exact daily workflows.
            </p>
          </div>

          <div className="row g-4">
            {/* Employee Role */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-lift">
                <div className="feature-icon-box bg-primary-subtle text-primary rounded-3 mb-3">
                  <i className="bi bi-person-badge fs-3"></i>
                </div>
                <h4 className="fw-bold h5">Employee Module</h4>
                <p className="text-muted small">
                  Self-service portal empowering every team member to manage their work life independently.
                </p>
                <ul className="list-unstyled small text-secondary d-flex flex-column gap-2 mb-0">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Live 1-Click Check-In / Check-Out</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Apply for Casual, Sick & Annual Leave</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Track Real-time Leave Balances & Status</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Enroll in Skill Training Programs</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>View Company-wide Bulletins & News</li>
                </ul>
              </div>
            </div>

            {/* Manager Role */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-lift border-top border-4 border-primary">
                <div className="feature-icon-box bg-indigo-subtle text-indigo rounded-3 mb-3">
                  <i className="bi bi-briefcase fs-3"></i>
                </div>
                <h4 className="fw-bold h5">Manager Module</h4>
                <p className="text-muted small">
                  Oversight and team facilitation tools to keep department operations smooth and transparent.
                </p>
                <ul className="list-unstyled small text-secondary d-flex flex-column gap-2 mb-0">
                  <li><i className="bi bi-check-circle-fill text-indigo me-2"></i>Approve & Reject Leave with Comments</li>
                  <li><i className="bi bi-check-circle-fill text-indigo me-2"></i>Monitor Team Attendance & Hours</li>
                  <li><i className="bi bi-check-circle-fill text-indigo me-2"></i>Assign & Supervise Team Training</li>
                  <li><i className="bi bi-check-circle-fill text-indigo me-2"></i>Track Team Performance Ratings</li>
                  <li><i className="bi bi-check-circle-fill text-indigo me-2"></i>Access Direct Team Directory</li>
                </ul>
              </div>
            </div>

            {/* HR / Admin Role */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-lift">
                <div className="feature-icon-box bg-purple-subtle text-purple rounded-3 mb-3">
                  <i className="bi bi-shield-check fs-3"></i>
                </div>
                <h4 className="fw-bold h5">HR Administrator Module</h4>
                <p className="text-muted small">
                  Enterprise-level administrative control, compliance tracking, and organizational intelligence.
                </p>
                <ul className="list-unstyled small text-secondary d-flex flex-column gap-2 mb-0">
                  <li><i className="bi bi-check-circle-fill text-purple me-2"></i>Full Employee & Manager Lifecycle CRUD</li>
                  <li><i className="bi bi-check-circle-fill text-purple me-2"></i>Company-wide Attendance Analytics</li>
                  <li><i className="bi bi-check-circle-fill text-purple me-2"></i>Centralized Leave Policy Enforcement</li>
                  <li><i className="bi bi-check-circle-fill text-purple me-2"></i>Publish Priority Broadcast Announcements</li>
                  <li><i className="bi bi-check-circle-fill text-purple me-2"></i>Executive Headcount & Metrics Reports</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-dark text-white-50 py-4 border-top border-secondary">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div className="small">
            © 2026 <strong>StaffSync HRMS</strong>. Modern Human Resource Management Solution.
          </div>
          <div className="small">
            Built with MongoDB, Express.js, React.js, Node.js & Bootstrap.
          </div>
        </div>
      </footer>
    </div>
  );
}
