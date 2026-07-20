import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const msg = await resetPassword(token, form.password);
      toast.success(msg);
      navigate('/login', { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <section className="section">
        <div className="container-narrow" style={{ maxWidth: 440, textAlign: 'center' }}>
          <h1 className="t-card-heading">Invalid reset link</h1>
          <p className="text-muted mt-sm">This link is missing its token.</p>
          <p className="text-muted mt-lg">
            <Link to="/forgot-password" style={{ color: 'var(--action-blue)' }}>
              Request a new link
            </Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container-narrow" style={{ maxWidth: 440 }}>
        <h1 className="t-card-heading">Choose a new password</h1>

        <form className="card card-pad mt-xl" onSubmit={submit} style={{ borderRadius: 'var(--r-lg)' }} noValidate>
          {errors.form && (
            <div className="toast toast-error" style={{ marginBottom: 16 }}>{errors.form}</div>
          )}

          <div className={`field ${errors.password ? 'has-error' : ''}`}>
            <label htmlFor="password">New password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className={`field ${errors.confirm ? 'has-error' : ''}`}>
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              className="input"
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>

          <button className="btn btn-primary btn-block mt-md" type="submit" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      </div>
    </section>
  );
}
