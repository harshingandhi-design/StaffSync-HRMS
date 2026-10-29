import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, closeSidebar }) {
  const { user, isHR, isManager } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: 'bi-grid-1x2-fill',
    },
    {
      to: '/attendance',
      label: 'Attendance',
      icon: 'bi-clock-history',
    },
    {
      to: '/leaves',
      label: 'Leave Management',
      icon: 'bi-calendar-check-fill',
    },
    {
      to: '/employees',
      label: 'Employee Directory',
      icon: 'bi-people-fill',
    },
    {
      to: '/announcements',
      label: 'Announcements',
      icon: 'bi-megaphone-fill',
    },
    {
      to: '/trainings',
      label: 'Training & Skills',
      icon: 'bi-mortarboard-fill',
    },
  ];

  // Add Analytics if Manager or HR
  if (isManager || isHR) {
    navItems.push({
      to: '/analytics',
      label: 'Reports & Analytics',
      icon: 'bi-bar-chart-fill',
    });
  }

  // Personal Profile
  navItems.push({
    to: '/profile',
    label: 'My Profile',
    icon: 'bi-person-circle',
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop d-lg-none" onClick={closeSidebar}></div>}

      <aside className={`sidebar bg-white border-end ${isOpen ? 'show' : ''}`}>
        <div className="p-3 border-bottom d-none d-lg-block">
          <small className="text-muted text-uppercase fw-bold letter-spacing">
            StaffSync Workspace
          </small>
        </div>

        <div className="p-2">
          <ul className="nav nav-pills flex-column gap-1">
            {navItems.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 fw-medium ${
                      isActive ? 'active shadow-sm' : 'text-secondary hover-bg'
                    }`
                  }
                >
                  <i className={`bi ${item.icon} fs-5`}></i>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Current User Quick Info Card in Sidebar Bottom */}
        <div className="mt-auto p-3 border-top m-2 rounded-3 bg-light">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-shield-lock-fill text-primary"></i>
            <div>
              <div className="fw-semibold small text-dark">{user?.name}</div>
              <small className="text-muted d-block lh-1 text-capitalize">{user?.role} Portal</small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
