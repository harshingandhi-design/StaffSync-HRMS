import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';

export default function LeavePage() {
  const { user, isHR, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [leaveBalance, setLeaveBalance] = useState({ casual: 12, sick: 8, annual: 15 });
  const [myLeaves, setMyLeaves] = useState([]);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Apply Leave Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaveData = async () => {
    try {
      const [myRes, teamRes] = await Promise.all([
        api.get('/leaves/my-leaves').catch(() => ({ data: { leaves: [], leaveBalance: {} } })),
        (isManager || isHR) ? api.get(isHR ? '/leaves/all' : '/leaves/pending').catch(() => ({ data: { leaves: [] } })) : Promise.resolve({ data: { leaves: [] } }),
      ]);

      setMyLeaves(myRes.data.leaves || []);
      if (myRes.data.leaveBalance) setLeaveBalance(myRes.data.leaveBalance);
      setTeamLeaves(teamRes.data.leaves || []);
    } catch {
      toast.error('Failed to load leave data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyForm.startDate || !applyForm.endDate || !applyForm.reason) {
      toast.warning('Please fill in all leave details.');
      return;
    }

    try {
      const res = await api.post('/leaves/apply', applyForm);
      toast.success(res.data.message || 'Leave applied successfully!');
      setShowApplyModal(false);
      setApplyForm({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
      fetchLeaveData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave.');
    }
  };

  const handleReviewAction = async (leaveId, status) => {
    const comments = window.prompt(`Enter review feedback for this ${status.toLowerCase()}:`, status === 'Approved' ? 'Approved.' : 'Declined.');
    if (comments === null) return;

    try {
      await api.put(`/leaves/${leaveId}/status`, { status, reviewComments: comments });
      toast.success(`Leave request ${status.toLowerCase()}.`);
      fetchLeaveData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review leave.');
    }
  };

  const filteredMyLeaves = statusFilter === 'All'
    ? myLeaves
    : myLeaves.filter((l) => l.status === statusFilter);

  return (
    <div className="leaves-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Leave Management</h1>
          <p className="text-muted small mb-0">Apply for time off, view balances, and track approval status</p>
        </div>

        <div className="d-flex gap-2">
          {(isManager || isHR) && (
            <div className="btn-group p-1 bg-white border rounded-3 shadow-sm">
              <button
                className={`btn btn-sm ${activeTab === 'my-leaves' ? 'btn-primary' : 'btn-light text-secondary'}`}
                onClick={() => setActiveTab('my-leaves')}
              >
                My Leaves
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'approvals' ? 'btn-primary' : 'btn-light text-secondary'}`}
                onClick={() => setActiveTab('approvals')}
              >
                {isHR ? 'Company Leaves' : 'Team Approvals'}
              </button>
            </div>
          )}

          <button className="btn btn-primary btn-sm fw-semibold shadow-sm px-3" onClick={() => setShowApplyModal(true)}>
            <i className="bi bi-plus-lg me-1"></i> Apply for Leave
          </button>
        </div>
      </div>

      {activeTab === 'my-leaves' ? (
        <>
          {/* Leave Balance Counters */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white h-100">
                <span className="small text-muted fw-bold text-uppercase">Casual Leave</span>
                <div className="display-5 fw-bold text-primary my-2">{leaveBalance.casual}</div>
                <small className="text-muted">Available days remaining</small>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white h-100">
                <span className="small text-muted fw-bold text-uppercase">Sick Leave</span>
                <div className="display-5 fw-bold text-success my-2">{leaveBalance.sick}</div>
                <small className="text-muted">Available days remaining</small>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white h-100">
                <span className="small text-muted fw-bold text-uppercase">Annual Leave</span>
                <div className="display-5 fw-bold text-warning-emphasis my-2">{leaveBalance.annual}</div>
                <small className="text-muted">Available days remaining</small>
              </div>
            </div>
          </div>

          {/* My Leaves History */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <h2 className="h5 fw-bold mb-0">My Leave Applications</h2>
              <div className="d-flex gap-1">
                {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Leave Type</th>
                    <th>Date Range</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Manager Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMyLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No leave applications found matching your selection.
                      </td>
                    </tr>
                  ) : (
                    filteredMyLeaves.map((l) => (
                      <tr key={l._id}>
                        <td><span className="badge bg-light text-dark border">{l.leaveType}</span></td>
                        <td>
                          {new Date(l.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
                          {new Date(l.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="fw-semibold">{l.totalDays} day(s)</td>
                        <td className="small text-truncate max-w-250" title={l.reason}>{l.reason}</td>
                        <td>
                          <span className={`badge ${l.status === 'Approved' ? 'bg-success' : l.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="small text-muted">
                          {l.reviewComments || (l.status === 'Pending' ? 'Under Review' : 'Reviewed')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Manager / HR Approvals View */
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="h5 fw-bold mb-0">{isHR ? 'Company-Wide Leave Requests' : 'Team Leave Approvals'}</h2>
              <small className="text-muted">Take immediate action on time-off requests</small>
            </div>
            <span className="badge bg-primary px-3 py-2 rounded-pill">
              {teamLeaves.filter((l) => l.status === 'Pending').length} Pending
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {teamLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No leave requests in the queue.
                    </td>
                  </tr>
                ) : (
                  teamLeaves.map((l) => (
                    <tr key={l._id}>
                      <td>
                        <div className="fw-bold">{l.employee?.firstName} {l.employee?.lastName}</div>
                        <small className="text-muted">{l.employee?.department} · {l.employee?.employeeId}</small>
                      </td>
                      <td><span className="badge bg-light text-dark border">{l.leaveType}</span></td>
                      <td>
                        <span className="fw-semibold">{l.totalDays} Day(s)</span>
                        <small className="d-block text-muted text-xs">
                          {new Date(l.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} to{' '}
                          {new Date(l.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </small>
                      </td>
                      <td className="small text-truncate max-w-200" title={l.reason}>{l.reason}</td>
                      <td>
                        <span className={`badge ${l.status === 'Approved' ? 'bg-success' : l.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {l.status === 'Pending' ? (
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-success" onClick={() => handleReviewAction(l._id, 'Approved')}>
                              Approve
                            </button>
                            <button className="btn btn-outline-danger" onClick={() => handleReviewAction(l._id, 'Rejected')}>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <small className="text-muted">{l.reviewComments || 'Processed'}</small>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
          <div className="card shadow-lg border-0 rounded-4 max-w-500 w-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold mb-0">Apply for Time Off</h5>
              <button className="btn-close" onClick={() => setShowApplyModal(false)}></button>
            </div>
            <form onSubmit={handleApply}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Leave Type</label>
                <select
                  className="form-select"
                  value={applyForm.leaveType}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                >
                  <option value="Casual">Casual Leave (Balance: {leaveBalance.casual})</option>
                  <option value="Sick">Sick Leave (Balance: {leaveBalance.sick})</option>
                  <option value="Annual">Annual Vacation (Balance: {leaveBalance.annual})</option>
                  <option value="Maternity">Maternity Leave</option>
                  <option value="Paternity">Paternity Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Reason for Leave</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Provide context for your manager..."
                  required
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button type="button" className="btn btn-light" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 fw-semibold">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
