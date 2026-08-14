import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-purple text-white rounded-circle mb-3" style={{ width: '56px', height: '56px', backgroundColor: '#8b5cf6' }}>
            <i className="bi bi-person-plus" style={{ fontSize: '2.5rem' }}></i>
          </div>
          <h3 className="fw-bold text-white mb-1">Create Account</h3>
          <p className="text-secondary small">Smart Inventory Management System</p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 text-danger bg-opacity-10 bg-danger rounded-3 p-2 small mb-3 text-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-color text-muted" style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className="form-control glass-input border-start-0 ps-0"
                placeholder="JohnDoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-color text-muted" style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control glass-input border-start-0 ps-0"
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-color text-muted" style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <i className="bi bi-key"></i>
              </span>
              <input
                type="password"
                className="form-control glass-input border-start-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary small">Account Role</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-color text-muted" style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <i className="bi bi-shield-check"></i>
              </span>
              <select
                className="form-select glass-input glass-select border-start-0 ps-0"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin" style={{ background: '#0b0f19' }}>Admin (Full Access)</option>
                <option value="manager" style={{ background: '#0b0f19' }}>Manager (Standard Access)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-purple w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
            style={{ backgroundColor: '#8b5cf6' }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <>
                <span>Register</span>
                <i className="bi bi-arrow-right-short" style={{ fontSize: '1.2rem' }}></i>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="text-secondary small mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-purple text-decoration-none fw-semibold" style={{ color: '#8b5cf6' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
