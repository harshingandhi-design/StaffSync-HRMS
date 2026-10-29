import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';

export default function AttendancePage() {
  const { user, isHR, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('my-attendance');

  // My Attendance states
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ present: 0, late: 0, halfDay: 0, totalHours: 0 });
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [punching, setPunching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Team / Org Attendance states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [orgAttendance, setOrgAttendance] = useState([]);
  const [orgStats, setOrgStats] = useState({ totalEmployees: 0, presentCount: 0, rate: 0 });

  const fetchMyAttendance = async () => {
    try {
      const [todayRes, historyRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/my-history', { params: { month, year } }),
      ]);
      setTodayRecord(todayRes.data.record);
      setHistory(historyRes.data.history || []);
      setStats(historyRes.data.stats || { present: 0, late: 0, halfDay: 0, totalHours: 0 });
    } catch {
      toast.error('Failed to load attendance.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamOrOrgAttendance = async () => {
    try {
      const endpoint = isHR ? '/attendance/all' : '/attendance/team';
      const res = await api.get(endpoint, { params: { date: selectedDate } });
      setOrgAttendance(res.data.records || []);
      if (isHR) {
        setOrgStats({
          totalEmployees: res.data.totalEmployees || 0,
          presentCount: res.data.presentCount || 0,
          rate: res.data.rate || 0,
        });
      }
    } catch {
      toast.error('Failed to load team attendance.');
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, [month, year]);

  useEffect(() => {
    if (activeTab === 'team-attendance') {
      fetchTeamOrOrgAttendance();
    }
  }, [activeTab, selectedDate]);

  const handleCheckIn = async () => {
    try {
      setPunching(true);
      const res = await api.post('/attendance/check-in', { location: 'StaffSync Web App' });
      toast.success(res.data.message);
      fetchMyAttendance();
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
      toast.success(res.data.message);
      fetchMyAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally {
      setPunching(false);
    }
  };

  const isCheckedIn = todayRecord && todayRecord.checkIn && !todayRecord.checkOut;
  const isCheckedOut = todayRecord && todayRecord.checkOut;

  return (
    <div className="attendance-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Attendance & Time Tracking</h1>
          <p className="text-muted small mb-0">Record daily work hours, view attendance logs, and track compliance</p>
        </div>

        {/* Tab switchers if Manager or HR */}
        {(isManager || isHR) && (
          <div className="btn-group p-1 bg-white border rounded-3 shadow-sm">
            <button
              className={`btn btn-sm ${activeTab === 'my-attendance' ? 'btn-primary' : 'btn-light text-secondary'}`}
              onClick={() => setActiveTab('my-attendance')}
            >
              My Attendance
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'team-attendance' ? 'btn-primary' : 'btn-light text-secondary'}`}
              onClick={() => setActiveTab('team-attendance')}
            >
              {isHR ? 'Company Roster' : 'Team Attendance'}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'my-attendance' ? (
        <>
          {/* Punch Widget & Monthly Stats */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-5 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100 bg-white">
                <span className="text-muted small fw-bold text-uppercase mb-2 d-block">
                  Today's Timecard ({new Date().toISOString().split('T')[0]})
                </span>

                <div className="my-3">
                  <div className="display-5 fw-bold text-dark">
                    {todayRecord?.workHours ? `${todayRecord.workHours}h` : isCheckedIn ? 'Counting...' : '0.0h'}
                  </div>
                  <span className={`badge mt-2 ${isCheckedOut ? 'bg-secondary' : isCheckedIn ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {isCheckedOut ? 'Shift Completed' : isCheckedIn ? 'Checked In' : 'Not Clocked In'}
                  </span>
                </div>

                <div className="bg-light p-2 rounded-3 mb-3 small d-flex justify-content-around">
                  <div>
                    <span className="text-muted d-block text-xs">IN</span>
                    <strong className="text-dark">
                      {todayRecord?.checkIn
                        ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '--:--'}
                    </strong>
                  </div>
                  <div className="border-end"></div>
                  <div>
                    <span className="text-muted d-block text-xs">OUT</span>
                    <strong className="text-dark">
                      {todayRecord?.checkOut
                        ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '--:--'}
                    </strong>
                  </div>
                </div>

                {!isCheckedIn && !isCheckedOut && (
                  <button className="btn btn-primary w-100 py-2 fw-semibold rounded-3 shadow-sm" onClick={handleCheckIn} disabled={punching}>
                    <i className="bi bi-box-arrow-in-right me-1"></i> Punch In
                  </button>
                )}
                {isCheckedIn && !isCheckedOut && (
                  <button className="btn btn-danger w-100 py-2 fw-semibold rounded-3 shadow-sm" onClick={handleCheckOut} disabled={punching}>
                    <i className="bi bi-box-arrow-left me-1"></i> Punch Out
                  </button>
                )}
                {isCheckedOut && (
                  <button className="btn btn-secondary w-100 py-2 rounded-3" disabled>
                    <i className="bi bi-check2-circle me-1"></i> Shift Recorded
                  </button>
                )}
              </div>
            </div>

            <div className="col-12 col-md-7 col-lg-8">
              <div className="row g-3 h-100">
                <div className="col-6 col-sm-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center h-100">
                    <span className="small text-muted fw-bold">PRESENT DAYS</span>
                    <div className="display-6 fw-bold text-success my-2">{stats.present}</div>
                    <small className="text-muted">On time</small>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center h-100">
                    <span className="small text-muted fw-bold">LATE ARRIVALS</span>
                    <div className="display-6 fw-bold text-warning-emphasis my-2">{stats.late}</div>
                    <small className="text-muted">Past 9:30 AM</small>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center h-100">
                    <span className="small text-muted fw-bold">HALF DAYS</span>
                    <div className="display-6 fw-bold text-info my-2">{stats.halfDay}</div>
                    <small className="text-muted">&lt; 4.5 hours</small>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center h-100">
                    <span className="small text-muted fw-bold">TOTAL HOURS</span>
                    <div className="display-6 fw-bold text-primary my-2">{stats.totalHours}</div>
                    <small className="text-muted">Logged hours</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance History Table */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <h2 className="h5 fw-bold mb-0">Monthly Attendance History</h2>
              <div className="d-flex gap-2">
                <select className="form-select form-select-sm" value={month} onChange={(e) => setMonth(e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('en', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select className="form-select form-select-sm" value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Work Duration</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No attendance records logged for this selected month.
                      </td>
                    </tr>
                  ) : (
                    history.map((record) => (
                      <tr key={record._id}>
                        <td className="fw-semibold text-dark">
                          {new Date(record.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <span className={`badge ${record.status === 'Present' ? 'bg-success' : record.status === 'Late' ? 'bg-warning text-dark' : 'bg-info'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td>
                          {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </td>
                        <td>
                          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </td>
                        <td>
                          <strong>{record.workHours || 0} hrs</strong>
                        </td>
                        <td className="text-muted small">{record.checkInLocation || 'Office'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Team / Company-wide Attendance View */
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
            <div>
              <h2 className="h5 fw-bold mb-0">{isHR ? 'Company-Wide Attendance Records' : 'Team Daily Attendance'}</h2>
              <small className="text-muted">Real-time attendance roster for all staff</small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="small text-muted fw-bold">Select Date:</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {isHR && (
            <div className="alert alert-primary d-flex align-items-center justify-content-between py-2 px-3 mb-3 small">
              <span>Organization Attendance Rate: <strong>{orgStats.rate}%</strong> ({orgStats.presentCount} of {orgStats.totalEmployees} employees present)</span>
              <span className="badge bg-primary">Live Data</span>
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {orgAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No check-ins recorded for this date yet.
                    </td>
                  </tr>
                ) : (
                  orgAttendance.map((rec) => (
                    <tr key={rec._id}>
                      <td>
                        <div className="fw-bold">{rec.employee?.firstName} {rec.employee?.lastName}</div>
                        <small className="text-muted">{rec.employee?.designation} · {rec.employee?.employeeId}</small>
                      </td>
                      <td>{rec.employee?.department}</td>
                      <td>
                        <span className={`badge ${rec.status === 'Present' ? 'bg-success' : rec.status === 'Late' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td>{rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                      <td>{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                      <td className="fw-semibold">{rec.workHours || 0}h</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
