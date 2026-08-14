import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-cyan text-dark rounded-circle mb-3" style={{ width: '56px', height: '56px', backgroundColor: '#06b6d4' }}>
            <i className="bi bi-shield-lock" style={{ fontSize: '2rem' }}></i>
          </div>
          <h3 className="fw-bold text-white mb-1">Welcome Back</h3>
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
            <label className="form-label text-secondary small">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-color text-muted" style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control glass-input border-start-0 ps-0"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between">
              <label className="form-label text-secondary small">Password</label>
            </div>
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

          <button
            type="submit"
            className="btn btn-cyan w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <>
                <span>Sign In</span>
                <i className="bi bi-arrow-right-short" style={{ fontSize: '1.2rem' }}></i>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="text-secondary small mb-0">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan text-decoration-none fw-semibold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
