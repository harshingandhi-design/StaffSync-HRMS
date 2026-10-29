import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';

export default function TrainingsPage() {
  const { user, isHR, isManager } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);

  // Create Training Modal
  const [showModal, setShowModal] = useState(false);
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    instructor: '',
    department: 'All',
    startDate: '',
    endDate: '',
    maxSeats: 25,
    skillsCovered: '',
  });

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await api.get('/trainings', { params });
      setTrainings(res.data.trainings || []);
    } catch {
      toast.error('Failed to load training programs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, [statusFilter]);

  const handleEnroll = async (id) => {
    try {
      setEnrollingId(id);
      const res = await api.post(`/trainings/${id}/enroll`);
      toast.success(res.data.message || 'Successfully enrolled in program!');
      fetchTrainings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newTraining,
        skillsCovered: newTraining.skillsCovered.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await api.post('/trainings', payload);
      toast.success('Training program created and scheduled!');
      setShowModal(false);
      setNewTraining({
        title: '',
        description: '',
        instructor: '',
        department: 'All',
        startDate: '',
        endDate: '',
        maxSeats: 25,
        skillsCovered: '',
      });
      fetchTrainings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not schedule training.');
    }
  };

  const myEmployeeId = user?.employeeProfile?._id || user?.employeeProfile;

  return (
    <div className="trainings-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Learning & Skill Development</h1>
          <p className="text-muted small mb-0">Explore professional certifications, workshops, and coaching sessions</p>
        </div>

        <div className="d-flex gap-2">
          <div className="btn-group p-1 bg-white border rounded-3 shadow-sm">
            {['All', 'Upcoming', 'Ongoing', 'Completed'].map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-light text-secondary'}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          {(isHR || isManager) && (
            <button className="btn btn-primary btn-sm fw-semibold shadow-sm px-3" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-lg me-1"></i> Schedule Training
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted small mt-2">Loading programs...</p>
        </div>
      ) : trainings.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i className="bi bi-mortarboard fs-1 text-muted"></i>
          <h5 className="mt-2 fw-bold">No Training Sessions Found</h5>
          <p className="text-muted small">Check back soon for new internal coaching and technical tracks.</p>
        </div>
      ) : (
        <div className="row g-4">
          {trainings.map((t) => {
            const isEnrolled = t.enrolledEmployees?.some(
              (emp) => (emp._id || emp).toString() === myEmployeeId?.toString()
            );
            const enrolledCount = t.enrolledEmployees?.length || 0;
            const percentFilled = Math.min(100, Math.round((enrolledCount / (t.maxSeats || 30)) * 100));

            return (
              <div className="col-12 col-md-6" key={t._id}>
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-column hover-lift">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                      {t.department} Department
                    </span>
                    <span className={`badge ${t.status === 'Ongoing' ? 'bg-success' : t.status === 'Upcoming' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                      ● {t.status}
                    </span>
                  </div>

                  <h2 className="h5 fw-bold text-dark mb-1">{t.title}</h2>
                  <small className="text-muted mb-3 d-block">
                    <i className="bi bi-person-video3 me-1 text-primary"></i> Instructor: <strong>{t.instructor}</strong>
                  </small>

                  <p className="text-secondary small mb-3 flex-grow-1">{t.description}</p>

                  {/* Skills Covered Badges */}
                  {t.skillsCovered?.length > 0 && (
                    <div className="d-flex gap-1 flex-wrap mb-3">
                      {t.skillsCovered.map((skill, idx) => (
                        <span key={idx} className="badge bg-light text-secondary border small">
                          #{skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Enrollment Progress */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between text-xs text-muted mb-1">
                      <span>Seats Enrolled: {enrolledCount} / {t.maxSeats}</span>
                      <span>{percentFilled}% Capacity</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div
                        className={`progress-bar ${percentFilled >= 100 ? 'bg-danger' : 'bg-primary'}`}
                        style={{ width: `${percentFilled}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                    <small className="text-muted text-xs">
                      <i className="bi bi-calendar-event me-1"></i>
                      {new Date(t.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} to{' '}
                      {new Date(t.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </small>

                    {isEnrolled ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle p-2">
                        <i className="bi bi-check-circle-fill me-1"></i> Enrolled
                      </span>
                    ) : t.status === 'Completed' ? (
                      <span className="badge bg-light text-muted border p-2">Completed</span>
                    ) : enrolledCount >= t.maxSeats ? (
                      <span className="badge bg-danger-subtle text-danger border p-2">Session Full</span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm px-3 fw-semibold shadow-sm"
                        onClick={() => handleEnroll(t._id)}
                        disabled={enrollingId === t._id}
                      >
                        {enrollingId === t._id ? 'Enrolling...' : 'Enroll Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Training Modal */}
      {showModal && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
          <div className="card shadow-lg border-0 rounded-4 max-w-600 w-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold mb-0">Schedule Training Program</h5>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Program Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Advanced System Architecture"
                  required
                  value={newTraining.title}
                  onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Instructor Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={newTraining.instructor}
                    onChange={(e) => setNewTraining({ ...newTraining, instructor: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Target Department</label>
                  <select
                    className="form-select"
                    value={newTraining.department}
                    onChange={(e) => setNewTraining({ ...newTraining, department: e.target.value })}
                  >
                    <option value="All">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">HR</option>
                  </select>
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={newTraining.startDate}
                    onChange={(e) => setNewTraining({ ...newTraining, startDate: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={newTraining.endDate}
                    onChange={(e) => setNewTraining({ ...newTraining, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-semibold">Max Seats</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newTraining.maxSeats}
                    onChange={(e) => setNewTraining({ ...newTraining, maxSeats: e.target.value })}
                  />
                </div>
                <div className="col-8">
                  <label className="form-label small fw-semibold">Skills Covered (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. React, Node, DevOps"
                    value={newTraining.skillsCovered}
                    onChange={(e) => setNewTraining({ ...newTraining, skillsCovered: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Overview of syllabus, modules, and goals..."
                  required
                  value={newTraining.description}
                  onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 fw-semibold">
                  Publish Training
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
