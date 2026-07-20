import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo" onClick={close}>
          WriteBlog
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/blogs" className="nav-link" onClick={close}>
            Explore
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className="nav-link" onClick={close}>
                Dashboard
              </NavLink>
              <NavLink to="/create" className="nav-link" onClick={close}>
                Write
              </NavLink>
              <Link
                to="/profile"
                className="row gap-sm"
                onClick={close}
                style={{ color: 'inherit' }}
              >
                <Avatar user={user} size={32} />
                <span className="nav-link">{user.username}</span>
              </Link>
              <button className="btn btn-outline" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link" onClick={close}>
                Log in
              </NavLink>
              <Link to="/signup" className="btn btn-primary btn-sm" onClick={close}>
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
