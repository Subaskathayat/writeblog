import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import BlogCard from '../components/BlogCard.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/blogs', { params: { limit: 6, sort: 'recent' } })
      .then((res) => setBlogs(res.data.blogs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="section">
        <div className="container">
          <div className="hero-band" style={{ padding: 'clamp(40px, 7vw, 80px)' }}>
            <p className="t-mono" style={{ color: 'var(--action-blue)' }}>
              A blogging platform
            </p>
            <h1 className="t-hero mt-md" style={{ maxWidth: 900 }}>
              Where ideas find their voice.
            </h1>
            <p
              className="t-body-large mt-lg"
              style={{ maxWidth: 560, color: 'var(--body-muted)' }}
            >
              Write, publish, and discover thoughtful writing. Create your own
              space, build an audience, and join the conversation.
            </p>
            <div className="row gap-lg mt-xl wrap">
              <Link to="/signup" className="btn btn-primary">
                Start writing
              </Link>
              <Link to="/blogs" className="btn btn-secondary">
                Explore blogs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="row between wrap" style={{ marginBottom: 32 }}>
            <h2 className="t-card-heading">Latest stories</h2>
            <Link to="/blogs" className="btn btn-secondary">
              View all →
            </Link>
          </div>

          {loading ? (
            <Spinner full />
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <p className="t-feature-heading">No stories yet.</p>
              <p className="mt-sm">Be the first to publish something.</p>
              <Link to="/signup" className="btn btn-primary mt-lg">
                Get started
              </Link>
            </div>
          ) : (
            <div className="grid grid-3">
              {blogs.map((b) => (
                <BlogCard key={b._id} blog={b} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
