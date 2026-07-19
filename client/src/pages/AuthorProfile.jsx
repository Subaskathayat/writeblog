import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import BlogCard from '../components/BlogCard.jsx';
import Avatar from '../components/Avatar.jsx';
import Spinner from '../components/Spinner.jsx';
import { formatDate } from '../utils/format.js';

export default function AuthorProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/users/${userId}`),
      api.get('/blogs', { params: { author: userId, limit: 50 } }),
    ])
      .then(([u, b]) => {
        setProfile(u.data);
        setBlogs(b.data.blogs);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Spinner full />;
  if (!profile) {
    return (
      <div className="empty-state section">
        <p className="t-feature-heading">Author not found.</p>
      </div>
    );
  }

  const { user, publishedCount } = profile;

  return (
    <section className="section">
      <div className="container">
        {/* Header */}
        <div className="row gap-xl wrap">
          <Avatar user={user} size={64} />
          <div className="stack" style={{ gap: 6 }}>
            <h1 className="t-card-heading">{user.username}</h1>
            <span className="text-muted">
              {publishedCount} published {publishedCount === 1 ? 'story' : 'stories'} · Joined{' '}
              {formatDate(user.createdAt)}
            </span>
            {user.bio && <p className="t-body mt-sm" style={{ maxWidth: 560 }}>{user.bio}</p>}
          </div>
        </div>

        <hr className="divider" style={{ margin: '40px 0' }} />

        {blogs.length === 0 ? (
          <div className="empty-state">
            <p className="t-feature-heading">No published stories yet.</p>
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
  );
}
