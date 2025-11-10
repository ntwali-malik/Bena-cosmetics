import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../@authService';
import { getCurrentUser } from '../services/authService';
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
      .then(async (data) => {
        // Ensure user data is properly normalized and saved
        let user = data?.user || {};
        
        // Normalize role immediately
        if (user.role) {
          user.role = (user.role + '').toLowerCase().trim();
        } else if (data?.role) {
          user.role = (data.role + '').toLowerCase().trim();
        } else {
          user.role = 'staff'; // default
        }
        
        // Save the normalized user to localStorage
        try {
          localStorage.setItem('auth.user', JSON.stringify(user));
        } catch (e) {
          console.error('Failed to save user to localStorage:', e);
        }
        
        // Wait a moment to ensure localStorage is written
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify the save worked
        const savedUser = getCurrentUser();
        console.log('Login - User saved:', user);
        console.log('Login - User retrieved:', savedUser);
        console.log('Login - Role:', user.role);
        
        // Get the final role (from saved user or fallback)
        const role = (savedUser?.role || user.role || 'staff').toLowerCase().trim();
        console.log('Login - Final role for navigation:', role);
        console.log('Login - Is admin?', role === 'admin');
        
        // Validate role one more time before navigation
        const finalRole = getCurrentUser()?.role?.toLowerCase().trim() || role;
        console.log('Login - Final validation - Role:', finalRole);
        
        if (!finalRole || finalRole !== 'admin' && finalRole !== 'staff') {
          console.error('Login - Invalid role detected:', finalRole);
          setError('Invalid user role. Please contact administrator.');
          return;
        }
        
        // Navigate based on normalized role - use full path to dashboard
        if (finalRole === 'admin') {
          console.log('✅ ADMIN USER - Navigating to /admin-dashboard/dashboard');
          navigate('/admin-dashboard/dashboard', { replace: true });
        } else if (finalRole === 'staff') {
          console.log('✅ STAFF USER - Navigating to /staff-dashboard/dashboard');
          navigate('/staff-dashboard/dashboard', { replace: true });
        } else {
          console.error('Login - Unexpected role:', finalRole);
          setError('Unable to determine user role. Please contact administrator.');
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


