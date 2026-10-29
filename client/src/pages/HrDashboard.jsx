import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';

export default function HrDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Employee Modal state
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'StaffSync@123',
    department: 'Engineering',
    designation: 'Software Engineer',
    salary: 75000,
    role: 'employee',
  });

  // Post Announcement Modal state
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [newAnn, setNewAnn] = useState({
    title: '',
    content: '',
    priority: 'Normal',
    category: 'General',
  });

  const loadHrData = async () => {
    try {
      const [analyticsRes, leaveRes, annRes] = await Promise.all([
        api.get('/analytics/dashboard-summary').catch(() => ({ data: { metrics: {}, departmentDistribution: [] } })),
        api.get('/leaves/pending').catch(() => ({ data: { leaves: [] } })),
        api.get('/announcements').catch(() => ({ data: { announcements: [] } })),
      ]);

      setMetrics(analyticsRes.data.metrics || {});
      setDepartments(analyticsRes.data.departmentDistribution || []);
      setPendingLeaves(leaveRes.data.leaves || []);
      setAnnouncements(annRes.data.announcements || []);
    } catch (err) {
      toast.error('Failed to load HR dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHrData();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', newEmp);
      toast.success(`Employee ${newEmp.firstName} created successfully!`);
      setShowAddEmpModal(false);
      setNewEmp({
        firstName: '',
        lastName: '',
        email: '',
        password: 'StaffSync@123',
        department: 'Engineering',
        designation: 'Software Engineer',
        salary: 75000,
        role: 'employee',
      });
      loadHrData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create employee.');
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', newAnn);
      toast.success('Announcement broadcasted across organization!');
      setShowAnnModal(false);
      setNewAnn({ title: '', content: '', priority: 'Normal', category: 'General' });
      loadHrData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post announcement.');
    }
  };

  const handleLeaveAction = async (leaveId, status) => {
    const comments = window.prompt(`Enter review note for ${status.toLowerCase()}:`, `Approved by HR.`);
    if (comments === null) return;

    try {
      await api.put(`/leaves/${leaveId}/status`, { status, reviewComments: comments });
      toast.success(`Leave request ${status.toLowerCase()}.`);
      loadHrData();
    } catch (err) {
      toast.error('Failed to update leave.');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-gradient-purple text-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="badge bg-white-20 text-white px-3 py-1 rounded-pill small mb-2 d-inline-block">
              StaffSync Global Operations · HR Administration
            </span>
            <h1 className="h3 fw-bold mb-1">
              HR Executive Dashboard, {user?.name} 👑
            </h1>
            <p className="text-white-80 mb-0 small">
              Manage organization workforce, track real-time attendance, and handle executive leave workflows.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light btn-sm fw-semibold shadow-sm" onClick={() => setShowAddEmpModal(true)}>
              <i className="bi bi-person-plus-fill me-1"></i> Add Employee
            </button>
            <button className="btn btn-outline-light btn-sm fw-semibold" onClick={() => setShowAnnModal(true)}>
              <i className="bi bi-megaphone-fill me-1"></i> Post Announcement
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase">Total Headcount</span>
              <div className="stat-icon bg-primary-subtle text-primary rounded-3">
                <i className="bi bi-buildings-fill"></i>
              </div>
            </div>
            <div className="display-6 fw-bold text-dark">{metrics?.totalEmployees || 0}</div>
            <small className="text-success fw-medium">
              <i className="bi bi-check-circle-fill me-1"></i> {metrics?.activeEmployees || 0} Active on payroll
            </small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase">Today's Attendance</span>
              <div className="stat-icon bg-success-subtle text-success rounded-3">
                <i className="bi bi-person-check-fill"></i>
              </div>
            </div>
            <div className="display-6 fw-bold text-success">{metrics?.attendanceRate || 0}%</div>
            <small className="text-muted">{metrics?.todayPresent || 0} checked in today</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase">Pending Leaves</span>
              <div className="stat-icon bg-warning-subtle text-warning-emphasis rounded-3">
                <i className="bi bi-calendar2-range-fill"></i>
              </div>
            </div>
            <div className="display-6 fw-bold text-warning-emphasis">{metrics?.pendingLeaves || 0}</div>
            <small className="text-muted">Awaiting decision</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase">Active Trainings</span>
              <div className="stat-icon bg-purple-subtle text-purple rounded-3">
                <i className="bi bi-mortarboard-fill"></i>
              </div>
            </div>
            <div className="display-6 fw-bold text-dark">{metrics?.activeTrainings || 0}</div>
            <small className="text-muted">Upskilling programs ongoing</small>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Department Distribution */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0">Department Distribution</h2>
              <Link to="/employees" className="small text-decoration-none fw-semibold">
                Directory <i className="bi bi-chevron-right"></i>
              </Link>
            </div>
            <div className="d-flex flex-column gap-3">
              {departments.map((dept) => {
                const percent = metrics?.totalEmployees ? Math.round((dept.count / metrics.totalEmployees) * 100) : 0;
                return (
                  <div key={dept.department}>
                    <div className="d-flex justify-content-between align-items-center mb-1 small fw-semibold">
                      <span>{dept.department}</span>
                      <span className="text-muted">{dept.count} Members ({percent}%)</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Company Announcements Feed */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0">Active Announcements</h2>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setShowAnnModal(true)}>
                + New Post
              </button>
            </div>
            <div className="d-flex flex-column gap-2">
              {announcements.slice(0, 3).map((a) => (
                <div key={a._id} className="p-3 rounded-3 bg-light border-start border-4 border-purple">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold small text-dark">{a.title}</span>
                    <span className={`badge ${a.priority === 'Urgent' ? 'bg-danger' : 'bg-secondary'} text-xs`}>
                      {a.priority}
                    </span>
                  </div>
                  <p className="small text-muted mb-0 text-truncate">{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Leave Requests Management */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 fw-bold mb-0">Organization Leave Requests Pending Action</h2>
          <Link to="/leaves" className="btn btn-sm btn-outline-primary">
            View All Leaves <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="text-center py-4 text-muted bg-light rounded-3">
            <i className="bi bi-check2-circle text-success fs-1"></i>
            <p className="mt-2 mb-0 small">No pending leave requests at this time.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th className="text-end">Review Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <div className="fw-bold">{l.employee?.firstName} {l.employee?.lastName}</div>
                      <small className="text-muted">{l.employee?.employeeId}</small>
                    </td>
                    <td>{l.employee?.department}</td>
                    <td><span className="badge bg-light text-dark border">{l.leaveType}</span></td>
                    <td className="fw-semibold small">{l.totalDays} day(s)</td>
                    <td className="small text-truncate max-w-200" title={l.reason}>{l.reason}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-success" onClick={() => handleLeaveAction(l._id, 'Approved')}>
                          Approve
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => handleLeaveAction(l._id, 'Rejected')}>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add New Employee */}
      {showAddEmpModal && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
          <div className="card shadow-lg border-0 rounded-4 max-w-600 w-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold mb-0">Add New Team Member</h5>
              <button className="btn-close" onClick={() => setShowAddEmpModal(false)}></button>
            </div>
            <form onSubmit={handleCreateEmployee}>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={newEmp.firstName}
                    onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={newEmp.lastName}
                    onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Work Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Department</label>
                  <select
                    className="form-select"
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">System Role</label>
                  <select
                    className="form-select"
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR Administrator</option>
                  </select>
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Designation</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Annual Salary (INR / USD)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newEmp.salary}
                    onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button type="button" className="btn btn-light" onClick={() => setShowAddEmpModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 fw-semibold">
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Post Announcement */}
      {showAnnModal && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
          <div className="card shadow-lg border-0 rounded-4 max-w-600 w-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold mb-0">Broadcast Company Announcement</h5>
              <button className="btn-close" onClick={() => setShowAnnModal(false)}></button>
            </div>
            <form onSubmit={handlePostAnnouncement}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Q4 Townhall & Strategy Briefing"
                  required
                  value={newAnn.title}
                  onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Priority Level</label>
                  <select
                    className="form-select"
                    value={newAnn.priority}
                    onChange={(e) => setNewAnn({ ...newAnn, priority: e.target.value })}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Category</label>
                  <select
                    className="form-select"
                    value={newAnn.category}
                    onChange={(e) => setNewAnn({ ...newAnn, category: e.target.value })}
                  >
                    <option value="General">General</option>
                    <option value="Townhall">Townhall</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Policy">Policy</option>
                    <option value="Celebration">Celebration</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Announcement Content</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Details of the announcement..."
                  required
                  value={newAnn.content}
                  onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button type="button" className="btn btn-light" onClick={() => setShowAnnModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-purple px-4 fw-semibold text-white">
                  Publish to Everyone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
