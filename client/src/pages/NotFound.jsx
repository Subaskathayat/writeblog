import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container empty-state">
        <h1 className="t-product-display">404</h1>
        <p className="t-body-large mt-md">This page wandered off.</p>
        <Link to="/" className="btn btn-primary mt-xl">
          Back home
        </Link>
      </div>
    </section>
  );
}
