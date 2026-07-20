import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login, resendVerification } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverified(false);
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      if (err.data?.needsVerification) setUnverified(true);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const msg = await resendVerification(form.email);
      toast.success(msg);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="section">
      <div className="container-narrow" style={{ maxWidth: 440 }}>
        <h1 className="t-card-heading">Welcome back</h1>
        <p className="text-muted mt-sm">Log in to continue writing.</p>

        <form className="card card-pad mt-xl" onSubmit={submit} style={{ borderRadius: 'var(--r-lg)' }}>
          {error && <div className="toast toast-error" style={{ marginBottom: 16 }}>{error}</div>}

          {unverified && (
            <button
              type="button"
              className="btn btn-block"
              style={{ marginBottom: 16 }}
              onClick={resend}
              disabled={resending}
            >
              {resending ? 'Sending…' : 'Resend verification email'}
            </button>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>

          <p className="text-muted mt-md" style={{ textAlign: 'center', fontSize: 14 }}>
            <Link to="/forgot-password" style={{ color: 'var(--action-blue)' }}>
              Forgot password?
            </Link>
          </p>
        </form>

        <p className="text-muted mt-lg" style={{ textAlign: 'center' }}>
          No account?{' '}
          <Link to="/signup" style={{ color: 'var(--action-blue)' }}>
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}
