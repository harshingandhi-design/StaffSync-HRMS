import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';

export default function AnnouncementsPage() {
  const { isHR } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Announcement Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    priority: 'Normal',
    category: 'General',
    targetAudience: 'All',
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.announcements || []);
    } catch {
      toast.error('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', form);
      toast.success('Announcement broadcasted to organization!');
      setShowModal(false);
      setForm({ title: '', content: '', priority: 'Normal', category: 'General', targetAudience: 'All' });
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post announcement.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement removed.');
      fetchAnnouncements();
    } catch {
      toast.error('Failed to delete announcement.');
    }
  };

  const priorityClasses = {
    Urgent: 'bg-danger text-white border-danger',
    High: 'bg-warning text-dark border-warning',
    Normal: 'bg-secondary text-white',
  };

  return (
    <div className="announcements-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Company Announcements</h1>
          <p className="text-muted small mb-0">Stay informed on enterprise updates, events, townhalls, and policies</p>
        </div>
        {isHR && (
          <button className="btn btn-primary btn-sm fw-semibold shadow-sm px-3" onClick={() => setShowModal(true)}>
            <i className="bi bi-megaphone-fill me-1"></i> Post Announcement
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted small mt-2">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i className="bi bi-megaphone fs-1 text-muted"></i>
          <h5 className="mt-2 fw-bold">No Announcements Yet</h5>
          <p className="text-muted small">Check back soon for news and official broadcasts from the People Team.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {announcements.map((a) => (
            <div
              key={a._id}
              className={`card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 ${
                a.priority === 'Urgent' ? 'border-danger' : a.priority === 'High' ? 'border-warning' : 'border-primary'
              }`}
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-2 mb-2">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className={`badge ${priorityClasses[a.priority] || 'bg-secondary'}`}>
                    {a.priority}
                  </span>
                  <span className="badge bg-light text-dark border">
                    {a.category}
                  </span>
                  <h2 className="h5 fw-bold mb-0 text-dark">{a.title}</h2>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    {new Date(a.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </small>
                  {isHR && (
                    <button
                      className="btn btn-outline-danger btn-sm p-1 text-xs"
                      onClick={() => handleDelete(a._id)}
                      title="Delete Announcement"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-secondary small mb-3 white-space-pre-line lh-lg">{a.content}</p>

              <div className="d-flex align-items-center justify-content-between pt-2 border-top text-xs text-muted">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-person-circle"></i>
                  <span>Broadcast by: <strong>{a.postedBy?.name || 'Human Resources'}</strong></span>
                </div>
                <span>Audience: <strong>{a.targetAudience}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Announcement Modal */}
      {showModal && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
          <div className="card shadow-lg border-0 rounded-4 max-w-600 w-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold mb-0">Publish Company Announcement</h5>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handlePost}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Announcement Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Q4 Townhall & Global Strategy Briefing"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-semibold">Priority</label>
                  <select
                    className="form-select"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="col-4">
                  <label className="form-label small fw-semibold">Category</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="General">General</option>
                    <option value="Townhall">Townhall</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Policy">Policy</option>
                    <option value="Celebration">Celebration</option>
                  </select>
                </div>
                <div className="col-4">
                  <label className="form-label small fw-semibold">Audience</label>
                  <select
                    className="form-select"
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  >
                    <option value="All">All Staff</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Human Resources">HR</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Body Content</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Enter detailed message..."
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 fw-semibold">
                  Publish Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
