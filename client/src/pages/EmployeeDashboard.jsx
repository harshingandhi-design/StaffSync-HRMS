import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({ casual: 12, sick: 8, annual: 15 });
  const [announcements, setAnnouncements] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);

  // Live digital clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [attRes, leaveRes, annRes, trainRes] = await Promise.all([
        api.get('/attendance/today').catch(() => ({ data: { record: null } })),
        api.get('/leaves/my-leaves').catch(() => ({ data: { leaves: [], leaveBalance: {} } })),
        api.get('/announcements').catch(() => ({ data: { announcements: [] } })),
        api.get('/trainings').catch(() => ({ data: { trainings: [] } })),
      ]);

      setAttendance(attRes.data);
      if (leaveRes.data.leaveBalance) setLeaveBalance(leaveRes.data.leaveBalance);
      setLeaves(leaveRes.data.leaves || []);
      setAnnouncements(annRes.data.announcements || []);
      setTrainings(trainRes.data.trainings || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setPunching(true);
      const res = await api.post('/attendance/check-in', { location: 'StaffSync Web Portal' });
      toast.success(res.data.message || 'Checked in successfully!');
      loadDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setPunching(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setPunching(true);
      const res = await api.post('/attendance/check-out');
      toast.success(res.data.message || 'Checked out successfully!');
      loadDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally {
      setPunching(false);
    }
  };

  const isCheckedIn = attendance?.isCheckedIn;
  const isCheckedOut = attendance?.isCheckedOut;
  const todayRecord = attendance?.record;

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-gradient-brand text-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="badge bg-white-20 text-white px-3 py-1 rounded-pill small mb-2 d-inline-block">
              {user?.employeeProfile?.employeeId || 'EMP'} · {user?.employeeProfile?.department || 'StaffSync'}
            </span>
            <h1 className="h3 fw-bold mb-1">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-white-80 mb-0 small">
              {user?.employeeProfile?.designation || 'Team Member'} · Have a productive day at work.
            </p>
          </div>
          <div className="text-md-end">
            <div className="display-6 fw-bold lh-1">{time}</div>
            <small className="text-white-70">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </small>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Attendance Punch In/Out Card */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0">Today's Attendance</h2>
              <span className={`badge ${isCheckedOut ? 'bg-secondary' : isCheckedIn ? 'bg-success' : 'bg-warning text-dark'}`}>
                {isCheckedOut ? 'Checked Out' : isCheckedIn ? 'Active On Duty' : 'Not Punched In'}
              </span>
            </div>

            <div className="p-3 bg-light rounded-3 mb-3 text-center">
              <div className="row g-2">
                <div className="col-6 border-end">
                  <small className="text-muted text-uppercase text-xs d-block">Check In Time</small>
                  <span className="fw-bold fs-5 text-dark">
                    {todayRecord?.checkIn
                      ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '--:--'}
                  </span>
                </div>
                <div className="col-6">
                  <small className="text-muted text-uppercase text-xs d-block">Check Out Time</small>
                  <span className="fw-bold fs-5 text-dark">
                    {todayRecord?.checkOut
                      ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '--:--'}
                  </span>
                </div>
              </div>
              {todayRecord?.workHours > 0 && (
                <div className="mt-2 pt-2 border-top small text-muted">
                  <i className="bi bi-stopwatch me-1 text-primary"></i>
                  Total Work Duration: <strong className="text-dark">{todayRecord.workHours} hrs</strong>
                </div>
              )}
            </div>

            <div className="d-flex gap-2 mt-auto">
              {!isCheckedIn && !isCheckedOut && (
                <button
                  className="btn btn-primary flex-grow-1 py-2 fw-semibold rounded-3 shadow-sm"
                  onClick={handleCheckIn}
                  disabled={punching}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i> Check In
                </button>
              )}
              {isCheckedIn && !isCheckedOut && (
                <button
                  className="btn btn-danger flex-grow-1 py-2 fw-semibold rounded-3 shadow-sm"
                  onClick={handleCheckOut}
                  disabled={punching}
                >
                  <i className="bi bi-box-arrow-left me-1"></i> Check Out
                </button>
              )}
              {isCheckedOut && (
                <button className="btn btn-secondary flex-grow-1 py-2 rounded-3" disabled>
                  <i className="bi bi-check2-all me-1"></i> Attendance Completed
                </button>
              )}
              <Link to="/attendance" className="btn btn-outline-secondary px-3" title="View Full Attendance History">
                <i className="bi bi-calendar3"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* Leave Balances Card */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0">Leave Balances</h2>
              <Link to="/leaves" className="btn btn-sm btn-outline-primary fw-medium">
                Apply Leave <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>

            <div className="row g-3">
              <div className="col-4">
                <div className="p-3 rounded-3 bg-primary-subtle text-center h-100">
                  <span className="display-6 fw-bold text-primary d-block">{leaveBalance.casual}</span>
                  <small className="fw-semibold text-primary text-uppercase text-xs">Casual Leave</small>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3 rounded-3 bg-success-subtle text-center h-100">
                  <span className="display-6 fw-bold text-success d-block">{leaveBalance.sick}</span>
                  <small className="fw-semibold text-success text-uppercase text-xs">Sick Leave</small>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3 rounded-3 bg-warning-subtle text-center h-100">
                  <span className="display-6 fw-bold text-warning-emphasis d-block">{leaveBalance.annual}</span>
                  <small className="fw-semibold text-warning-emphasis text-uppercase text-xs">Annual Leave</small>
                </div>
              </div>
            </div>

            {/* Recent Leaves Status */}
            <div className="mt-4 pt-3 border-top">
              <span className="small fw-bold text-muted text-uppercase text-xs d-block mb-2">
                Recent Leave Applications
              </span>
              {leaves.length === 0 ? (
                <small className="text-muted">No recent leave requests applied.</small>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {leaves.slice(0, 2).map((l) => (
                    <div key={l._id} className="d-flex justify-content-between align-items-center bg-light p-2 rounded-2 small">
                      <div>
                        <span className="fw-semibold text-dark">{l.leaveType} Leave</span>
                        <span className="text-muted ms-2 text-xs">
                          ({new Date(l.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} - {new Date(l.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                        </span>
                      </div>
                      <span className={`badge ${l.status === 'Approved' ? 'bg-success' : l.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Company Announcements */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0">Company Announcements</h2>
              <Link to="/announcements" className="small text-decoration-none fw-semibold">
                View All <i className="bi bi-chevron-right"></i>
              </Link>
            </div>
            {announcements.length === 0 ? (
              <p className="text-muted small">No announcements posted yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {announcements.slice(0, 3).map((a) => (
                  <div key={a._id} className="p-3 rounded-3 bg-light border-start border-4 border-primary">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span className="fw-bold text-dark">{a.title}</span>
                      <span className={`badge ${a.priority === 'Urgent' ? 'bg-danger' : a.priority === 'High' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {a.priority}
                      </span>
                    </div>
                    <p className="text-secondary small mb-2 line-clamp-2">{a.content}</p>
                    <div className="d-flex justify-content-between align-items-center text-xs text-muted">
                      <span>Posted by: {a.postedBy?.name || 'HR Team'}</span>
                      <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Training Programs */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0">Training & Upskilling</h2>
              <Link to="/trainings" className="small text-decoration-none fw-semibold">
                Explore <i className="bi bi-chevron-right"></i>
              </Link>
            </div>
            {trainings.length === 0 ? (
              <p className="text-muted small">No active training programs right now.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {trainings.slice(0, 3).map((t) => (
                  <div key={t._id} className="p-3 rounded-3 border bg-white">
                    <div className="d-flex justify-content-between align-items-start">
                      <span className="fw-semibold small text-dark">{t.title}</span>
                      <span className="badge bg-primary-subtle text-primary small">{t.status}</span>
                    </div>
                    <small className="text-muted d-block mt-1">Instructor: {t.instructor}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
