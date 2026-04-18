import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { login, resetPassword, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      const origin = location.state?.from?.pathname || '/';
      navigate(origin);
    } catch (err) {
      console.error(err);
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset password.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
      setError('');
    } catch (err) {
      setError('Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-[400px] animate-slide-up">
        <div className="mb-12 text-center">
          <img src="/SariLedger.png" alt="SariLedger" className="mx-auto mb-6 h-32 w-32 rounded-2xl object-cover shadow-sm" />
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in to SariLedger</h1>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm">
          {error && (
            <div className="mb-6 rounded-lg bg-coral/10 p-3 text-xs font-medium text-coral border border-coral/20 animate-fade-in">
              {error}
            </div>
          )}

          {resetSent && (
            <div className="mb-6 rounded-lg bg-emerald/10 p-3 text-xs font-medium text-emerald border border-emerald/20 animate-fade-in">
              Check your inbox for a password reset link.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-body" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-xl border border-line bg-canvas pl-10 pr-4 text-sm transition-all focus:border-emerald focus:ring-4 focus:ring-emerald/5 outline-none"
                  placeholder="name@store.com"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-[13px] font-medium text-body" htmlFor="password">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[13px] font-medium text-emerald hover:text-emerald-dim transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-line bg-canvas pl-10 pr-12 text-sm transition-all focus:border-emerald focus:ring-4 focus:ring-emerald/5 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-emerald font-medium text-white shadow-lg shadow-emerald/20 hover:bg-emerald-dim disabled:opacity-70 transition-all duration-200 mt-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-10 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} SariLedger. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
