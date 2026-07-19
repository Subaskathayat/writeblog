export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-label">AI moves fast — so do ideas.</div>
        <div
          className="row between wrap"
          style={{ gap: 24, alignItems: 'flex-start', marginTop: 24 }}
        >
          <div className="stack" style={{ gap: 8, maxWidth: 320 }}>
            <div className="nav-logo" style={{ color: '#fff' }}>
              Inkwell
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              A clean, modern place to write, publish, and discover blogs.
            </p>
          </div>
          <div className="row gap-xl wrap">
            <a href="/blogs">Explore</a>
            <a href="/create">Write</a>
            <a href="/login">Log in</a>
            <a href="/signup">Sign up</a>
          </div>
        </div>
        <hr className="divider" style={{ margin: '32px 0 16px', opacity: 0.2 }} />
        <p style={{ color: 'var(--muted)', fontSize: 12 }}>
          © {new Date().getFullYear()} Inkwell. Built as a demo blogging platform.
        </p>
      </div>
    </footer>
  );
}
