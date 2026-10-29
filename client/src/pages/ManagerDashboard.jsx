import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchManagerData = async () => {
    try {
      const [teamRes, leaveRes, attRes] = await Promise.all([
        api.get('/employees/team').catch(() => ({ data: { team: [] } })),
        api.get('/leaves/pending').catch(() => ({ data: { leaves: [] } })),
        api.get('/attendance/team').catch(() => ({ data: { records: [] } })),
      ]);

      setTeam(teamRes.data.team || []);
      setPendingLeaves(leaveRes.data.leaves || []);
      setTeamAttendance(attRes.data.records || []);
    } catch (err) {
      toast.error('Failed to load manager dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  const handleLeaveDecision = async (leaveId, status) => {
    const comments = window.prompt(`Enter review comments for this ${status.toLowerCase()} action:`, status === 'Approved' ? 'Approved by Team Lead.' : 'Rejected due to project deadlines.');
    if (comments === null) return; // User cancelled prompt

    try {
      setProcessingId(leaveId);
      await api.put(`/leaves/${leaveId}/status`, { status, reviewComments: comments });
      toast.success(`Leave request ${status.toLowerCase()} successfully.`);
      fetchManagerData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave.');
    } finally {
      setProcessingId(null);
    }
  };

  const presentTodayCount = teamAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-gradient-indigo text-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="badge bg-white-20 text-white px-3 py-1 rounded-pill small mb-2 d-inline-block">
              {user?.employeeProfile?.department || 'Department'} · Team Management Portal
            </span>
            <h1 className="h3 fw-bold mb-1">
              Manager Command Center, {user?.name} 💼
            </h1>
            <p className="text-white-80 mb-0 small">
              Manage your team members, review leave requests, and oversee team performance.
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/attendance" className="btn btn-light btn-sm fw-semibold">
              <i className="bi bi-clock-history me-1"></i> Team Attendance
            </Link>
            <Link to="/trainings" className="btn btn-outline-light btn-sm fw-semibold">
              <i className="bi bi-plus-circle me-1"></i> Assign Training
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase">Direct Reports</span>
              <div className="stat-icon bg-primary-subtle text-primary rounded-3">
                <i className="bi bi-people-fill"></i>
              </div>
            </div>
            <div className="display-6 fw-bold text-dark">{team.length}</div>
            <small className="text-muted">Assigned team members</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase">Team Present Today</span>
              <div className="stat-icon bg-success-subtle text-success rounded-3">
                <i className="bi bi-check2-circle"></i>
              </div>
            </div>
            <div className="display-6 fw-bold text-success">{presentTodayCount} / {team.length}</div>
            <small className="text-muted">Checked in today</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase">Pending Leaves</span>
              <div className="stat-icon bg-warning-subtle text-warning-emphasis rounded-3">
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
            <div className="display-6 fw-bold text-warning-emphasis">{pendingLeaves.length}</div>
            <small className="text-muted">Awaiting your approval</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase">Avg Performance</span>
              <div className="stat-icon bg-info-subtle text-info rounded-3">
                <i className="bi bi-star-fill"></i>
              </div>
            </div>
            <div className="display-6 fw-bold text-dark">
              {team.length > 0
                ? (team.reduce((acc, t) => acc + (t.performanceRating || 4), 0) / team.length).toFixed(1)
                : '4.5'}
              <span className="fs-6 text-muted"> / 5.0</span>
            </div>
            <small className="text-muted">Department quality score</small>
          </div>
        </div>
      </div>

      {/* Pending Leave Requests Section */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="h5 fw-bold mb-0">Pending Leave Requests Awaiting Review</h2>
            <small className="text-muted">Review team member leave applications and provide comments</small>
          </div>
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
            {pendingLeaves.length} Action(s) Required
          </span>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="text-center py-4 bg-light rounded-3">
            <i className="bi bi-check-circle-fill text-success fs-1"></i>
            <h6 className="mt-2 fw-semibold">All Caught Up!</h6>
            <p className="text-muted small mb-0">There are no pending leave applications from your team.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Team Member</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Available Balance</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="fw-bold">{leave.employee?.firstName} {leave.employee?.lastName}</div>
                      <small className="text-muted">{leave.employee?.designation}</small>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td>
                      <div className="small fw-semibold">{leave.totalDays} Day(s)</div>
                      <small className="text-muted">
                        {new Date(leave.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
                        {new Date(leave.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </small>
                    </td>
                    <td className="small text-truncate max-w-200" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td>
                      <small className="text-muted">
                        Casual: {leave.employee?.leaveBalance?.casual || 0}d · Sick: {leave.employee?.leaveBalance?.sick || 0}d
                      </small>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-success fw-medium"
                          onClick={() => handleLeaveDecision(leave._id, 'Approved')}
                          disabled={processingId === leave._id}
                        >
                          <i className="bi bi-check-lg me-1"></i> Approve
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleLeaveDecision(leave._id, 'Rejected')}
                          disabled={processingId === leave._id}
                        >
                          <i className="bi bi-x-lg me-1"></i> Reject
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

      {/* Team Roster Grid */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 fw-bold mb-0">My Team Members ({team.length})</h2>
          <Link to="/employees" className="btn btn-sm btn-outline-primary">
            View Full Directory <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        <div className="row g-3">
          {team.map((member) => (
            <div className="col-12 col-md-6 col-lg-4" key={member._id}>
              <div className="card h-100 border rounded-3 p-3 bg-light">
                <div className="d-flex align-items-center gap-3">
                  {member.user?.avatar ? (
                    <img src={member.user.avatar} alt={member.firstName} className="avatar-img rounded-circle" />
                  ) : (
                    <div className="avatar-placeholder rounded-circle bg-indigo text-white fw-bold">
                      {member.firstName[0]}
                    </div>
                  )}
                  <div>
                    <h6 className="mb-0 fw-bold">{member.firstName} {member.lastName}</h6>
                    <small className="text-muted d-block">{member.designation}</small>
                    <small className="text-primary fw-semibold">{member.employeeId}</small>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-top d-flex justify-content-between text-xs text-muted">
                  <span>Rating: ⭐ {member.performanceRating || 4.2}</span>
                  <span>Joined: {new Date(member.dateOfJoining).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
