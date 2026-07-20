import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const msg = await forgotPassword(email);
      setMessage(msg);
      setSent(true);
    } catch (err) {
      setMessage(err.message);
      setSent(true); // generic response regardless
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="container-narrow" style={{ maxWidth: 440 }}>
        <h1 className="t-card-heading">Forgot your password?</h1>
        <p className="text-muted mt-sm">
          Enter your email and we'll send you a reset link.
        </p>

        <form className="card card-pad mt-xl" onSubmit={submit} style={{ borderRadius: 'var(--r-lg)' }}>
          {sent ? (
            <div className="toast" style={{ marginBottom: 8 }}>{message}</div>
          ) : (
            <>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </>
          )}
        </form>

        <p className="text-muted mt-lg" style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--action-blue)' }}>
            Back to log in
          </Link>
        </p>
      </div>
    </section>
  );
}
