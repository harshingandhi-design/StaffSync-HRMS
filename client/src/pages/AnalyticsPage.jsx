import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/analytics/dashboard-summary')
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted small mt-2">Compiling workforce analytics...</p>
      </div>
    );
  }

  const { metrics, departmentDistribution, recentAnnouncements } = data || {};

  return (
    <div className="analytics-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Workforce Reports & Analytics</h1>
          <p className="text-muted small mb-0">Operational intelligence on headcount, department distribution, and attendance rates</p>
        </div>
        <button
          className="btn btn-outline-primary btn-sm fw-semibold"
          onClick={() => window.print()}
        >
          <i className="bi bi-printer me-1"></i> Export / Print Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span className="small text-muted fw-bold text-uppercase">Total Headcount</span>
            <div className="display-6 fw-bold text-primary my-1">{metrics?.totalEmployees || 0}</div>
            <small className="text-success fw-medium">
              <i className="bi bi-check-circle-fill me-1"></i> {metrics?.activeEmployees || 0} active employees
            </small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span className="small text-muted fw-bold text-uppercase">Attendance Rate</span>
            <div className="display-6 fw-bold text-success my-1">{metrics?.attendanceRate || 0}%</div>
            <small className="text-muted">{metrics?.todayPresent || 0} on duty today</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span className="small text-muted fw-bold text-uppercase">Pending Leaves</span>
            <div className="display-6 fw-bold text-warning-emphasis my-1">{metrics?.pendingLeaves || 0}</div>
            <small className="text-muted">Awaiting supervisor decision</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span className="small text-muted fw-bold text-uppercase">Active Trainings</span>
            <div className="display-6 fw-bold text-purple my-1">{metrics?.activeTrainings || 0}</div>
            <small className="text-muted">Upskilling programs scheduled</small>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Department Headcount Breakdown */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h2 className="h5 fw-bold mb-3">Headcount by Department</h2>
            <div className="d-flex flex-column gap-3">
              {departmentDistribution?.map((dept) => {
                const percent = metrics?.totalEmployees
                  ? Math.round((dept.count / metrics.totalEmployees) * 100)
                  : 0;
                return (
                  <div key={dept.department}>
                    <div className="d-flex justify-content-between align-items-center mb-1 small fw-semibold">
                      <span className="text-dark">{dept.department}</span>
                      <span className="text-muted">{dept.count} Members · {percent}%</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className="progress-bar bg-gradient-brand"
                        role="progressbar"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Attendance & Shift Breakdown */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h2 className="h5 fw-bold mb-3">Daily Attendance Compliance</h2>
            <div className="p-3 bg-light rounded-3 mb-3 text-center">
              <span className="display-5 fw-bold text-success d-block">{metrics?.attendanceRate || 0}%</span>
              <small className="text-muted text-uppercase text-xs fw-semibold">Organization Overall Attendance</small>
            </div>

            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between p-2 rounded-2 bg-success-subtle text-success fw-medium">
                <span>Present & On-Time</span>
                <span>{(metrics?.todayPresent || 0) - (metrics?.todayLate || 0)} Staff</span>
              </div>
              <div className="d-flex justify-content-between p-2 rounded-2 bg-warning-subtle text-warning-emphasis fw-medium">
                <span>Late Check-Ins (Past 9:30 AM)</span>
                <span>{metrics?.todayLate || 0} Staff</span>
              </div>
              <div className="d-flex justify-content-between p-2 rounded-2 bg-danger-subtle text-danger fw-medium">
                <span>Absent / On Leave</span>
                <span>{Math.max(0, (metrics?.activeEmployees || 0) - (metrics?.todayPresent || 0))} Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
