import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Engineering',
    designation: 'Associate Software Engineer',
    role: 'employee',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.warning('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      toast.warning('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      toast.success('Registration complete! Welcome to StaffSync.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
      <div className="card shadow-lg border-0 rounded-4 auth-card overflow-hidden">
        <div className="p-4 p-md-5">
          <div className="text-center mb-4">
            <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-2">
              <span className="brand-logo-icon">
                <i className="bi bi-people-fill"></i>
              </span>
              <span className="fs-3 fw-bold text-dark">
                Staff<span className="text-primary">Sync</span>
              </span>
            </Link>
            <h2 className="h5 fw-bold text-dark">Create your account</h2>
            <p className="text-muted small">Join your organization workspace on StaffSync HRMS</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Work Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12 col-sm-6">
                <label className="form-label small fw-semibold">Department</label>
                <select
                  name="department"
                  className="form-select"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Design">Design</option>
                </select>
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label small fw-semibold">Initial Role</label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR Personnel</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Designation</label>
              <input
                type="text"
                name="designation"
                className="form-control"
                placeholder="e.g. Software Engineer"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Password (min 6 characters)</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold rounded-3 shadow-sm" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Setting up profile...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted small">Already have an account? </span>
            <Link to="/login" className="small fw-semibold text-primary text-decoration-none">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
