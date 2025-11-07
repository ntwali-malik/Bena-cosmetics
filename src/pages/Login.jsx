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
            <div className="brand-logo">●</div>
            <div className="brand-name">YOUR LOGO</div>
          </div>
          <div className="welcome">
            <h1>Hello, welcome!</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
              nisi risus.
            </p>
          </div>
          <button type="button" className="ghost-btn">View more</button>
        </div>

        <div className="auth-right">
          <form className="form" onSubmit={handleSubmit}>
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

            <div className="signup">
              <span>Not a member yet?</span>
              <Link className="secondary-btn" to="/login">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;


