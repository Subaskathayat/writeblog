import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const validate = () => {
    const e = {};
    if (form.username.trim().length < 2) e.username = 'Username must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await signup(form.username.trim(), form.email, form.password);
      setSentTo(data.email || form.email);
      toast.success('Account created! Check your email.');
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  const field = (name) => (form[name] !== undefined ? form[name] : '');

  if (sentTo) {
    return (
      <section className="section">
        <div className="container-narrow" style={{ maxWidth: 460 }}>
          <h1 className="t-card-heading">Check your inbox</h1>
          <div className="card card-pad mt-xl" style={{ borderRadius: 'var(--r-lg)' }}>
            <p className="text-muted">
              We sent a verification link to <strong>{sentTo}</strong>. Click the link in
              that email to activate your account, then log in. The link expires in 24 hours.
            </p>
            <p className="text-muted mt-lg" style={{ textAlign: 'center' }}>
              <Link to="/login" style={{ color: 'var(--action-blue)' }}>
                Go to log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container-narrow" style={{ maxWidth: 460 }}>
        <h1 className="t-card-heading">Create your account</h1>
        <p className="text-muted mt-sm">Start publishing in minutes.</p>

        <form className="card card-pad mt-xl" onSubmit={submit} style={{ borderRadius: 'var(--r-lg)' }} noValidate>
          {errors.form && (
            <div className="toast toast-error" style={{ marginBottom: 16 }}>
              {errors.form}
            </div>
          )}

          <div className={`field ${errors.username ? 'has-error' : ''}`}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="input"
              value={field('username')}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className={`field ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={field('email')}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="two-col">
            <div className={`field ${errors.password ? 'has-error' : ''}`}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                value={field('password')}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className={`field ${errors.confirm ? 'has-error' : ''}`}>
              <label htmlFor="confirm">Confirm</label>
              <input
                id="confirm"
                className="input"
                type="password"
                value={field('confirm')}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>
          </div>

          <button className="btn btn-primary btn-block mt-md" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-muted mt-lg" style={{ textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--action-blue)' }}>
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}
