import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success('Welcome back to StaffSync!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
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
            <h2 className="h5 fw-bold text-dark">Sign in to your workplace</h2>
            <p className="text-muted small">Enter your credentials to access your StaffSync dashboard</p>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mb-4 p-2 bg-light rounded-3 border">
            <small className="text-muted fw-bold d-block text-uppercase text-xs mb-2">
              🚀 Fast 1-Click Demo Credentials:
            </small>
            <div className="d-flex flex-wrap gap-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary flex-grow-1 text-xs"
                onClick={() => fillCredentials('hr@staffsync.com', 'StaffSync@123')}
              >
                👑 HR Director
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary flex-grow-1 text-xs"
                onClick={() => fillCredentials('manager.tech@staffsync.com', 'StaffSync@123')}
              >
                💼 Tech Manager
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-success flex-grow-1 text-xs"
                onClick={() => fillCredentials('rohan.mehta@staffsync.com', 'StaffSync@123')}
              >
                👨‍💻 Employee
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Work Email</label>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label small fw-semibold mb-0">Password</label>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-xs text-muted"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="input-group mt-1">
                <span className="input-group-text bg-white text-muted">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold rounded-3 mt-3 shadow-sm" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing in...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted small">New to StaffSync? </span>
            <Link to="/register" className="small fw-semibold text-primary text-decoration-none">
              Register account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
