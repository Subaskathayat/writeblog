import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const ran = useRef(false); // guard against React 18 StrictMode double-invoke

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }
    verifyEmail(token)
      .then(() => {
        setStatus('success');
        toast.success('Email verified! You are now logged in.');
        setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message);
      });
  }, [token, verifyEmail, navigate, toast]);

  return (
    <section className="section">
      <div className="container-narrow" style={{ maxWidth: 440, textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <h1 className="t-card-heading">Verifying your email…</h1>
            <p className="text-muted mt-sm">Hang tight for a moment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h1 className="t-card-heading">Email verified</h1>
            <p className="text-muted mt-sm">Redirecting you to your dashboard…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="t-card-heading">Verification failed</h1>
            <p className="text-muted mt-sm">{message}</p>
            <p className="text-muted mt-lg">
              <Link to="/login" style={{ color: 'var(--action-blue)' }}>
                Back to log in
              </Link>{' '}
              — you can request a new link there.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
