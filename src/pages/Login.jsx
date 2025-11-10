import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../@authService';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    loginRequest({ email, password })
      .then((data) => {
        const role = data?.user?.role || data?.role || 'staff';
        if (role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/staff-dashboard');
        }
      })
      .catch((err) => {
        setError(err?.message || 'Login failed');
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <div className="login-page">
      <div className="auth-card">
        <div className="auth-left">
          <div className="brand">
            <img src="/logo.png" alt="Bena Cosmetics" className="brand-img" />
            <div className="brand-name">Bena Cosmetics Ltd</div>
          </div>
          <div className="welcome">
            <h1>Welcome back</h1>
            <p>Sign in to manage products, inventory and sales with ease.</p>
          </div>
        </div>

        <div className="auth-right">
          <form className="form" onSubmit={handleSubmit}>
            <div className="mobile-brand">
              <img src="/logo.png" alt="Bena Cosmetics" />
              <h3>Bena Cosmetics Ltd</h3>
            </div>
            {error && <div className="error-banner">{error}</div>}
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="name@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="row between">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link className="link" to="/login">Forgot password?</Link>
            </div>

            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Login'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;


