import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifications = () => {
    if (user) {
      api
        .get('/notifications')
        .then((res) => {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const roleColors = {
    hr: 'badge-hr',
    manager: 'badge-manager',
    employee: 'badge-employee',
    admin: 'badge-hr',
  };

  return (
    <nav className="navbar navbar-expand bg-white border-bottom sticky-top px-3 py-2 top-nav">
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-sm btn-outline-secondary d-lg-none" onClick={toggleSidebar}>
          <i className="bi bi-list fs-5"></i>
        </button>
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/dashboard">
          <span className="brand-logo-icon">
            <i className="bi bi-people-fill"></i>
          </span>
          <span className="brand-text">Staff<span className="text-primary">Sync</span></span>
          <span className="badge bg-light text-muted border small d-none d-sm-inline-block">HRMS</span>
        </Link>
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="position-relative">
          <button
            className="btn btn-light position-relative notif-btn"
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <i className="bi bi-bell"></i>
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="notif-dropdown shadow-lg rounded-3 p-3 bg-white border position-absolute end-0 mt-2">
              <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                <span className="fw-bold small">Notifications</span>
                {unreadCount > 0 && (
                  <button className="btn btn-link btn-sm p-0 text-decoration-none small" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="text-center text-muted py-3 small">No notifications yet</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n._id}
                      className={`notif-item p-2 rounded mb-1 small ${n.isRead ? 'text-muted' : 'bg-light fw-medium'}`}
                    >
                      <div className="d-flex justify-content-between">
                        <span className="fw-semibold">{n.title}</span>
                        <span className="text-muted text-xs">
                          {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="mb-0 text-truncate">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Avatar */}
        <div className="d-flex align-items-center gap-2">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="avatar-img rounded-circle" />
          ) : (
            <div className="avatar-placeholder rounded-circle bg-primary text-white fw-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="d-none d-md-block text-start">
            <div className="fw-bold lh-1 small">{user?.name}</div>
            <span className={`badge ${roleColors[user?.role] || 'bg-secondary'} mt-1 text-uppercase`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          title="Sign Out"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span className="d-none d-sm-inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
