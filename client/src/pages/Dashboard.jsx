import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import { formatDate } from '../utils/format.js';

export default function Dashboard() {
  const toast = useToast();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, likesReceived: 0 });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/blogs/mine')
      .then((res) => {
        setBlogs(res.data.blogs);
        setStats(res.data.stats);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this blog permanently?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success('Blog deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const togglePublish = async (blog) => {
    const next = blog.status === 'published' ? 'draft' : 'published';
    try {
      await api.put(`/blogs/${blog._id}`, { status: next });
      toast.success(next === 'published' ? 'Blog published' : 'Moved to drafts');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner full />;

  const statCards = [
    { label: 'Total blogs', value: stats.total },
    { label: 'Published', value: stats.published },
    { label: 'Drafts', value: stats.drafts },
    { label: 'Likes received', value: stats.likesReceived },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="row between wrap" style={{ gap: 16 }}>
          <div>
            <h1 className="t-section-heading">Dashboard</h1>
            <p className="text-muted mt-sm">Welcome back, {user?.username}.</p>
          </div>
          <Link to="/create" className="btn btn-primary">
            + New blog
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-4 mt-xxl">
          {statCards.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-num">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Blog list */}
        <h2 className="t-card-heading mt-xxl">Your blogs</h2>

        {blogs.length === 0 ? (
          <div className="empty-state">
            <p className="t-feature-heading">You haven't written anything yet.</p>
            <Link to="/create" className="btn btn-primary mt-lg">
              Write your first blog
            </Link>
          </div>
        ) : (
          <div className="stack mt-lg">
            {blogs.map((b) => (
              <div
                key={b._id}
                className="row between wrap"
                style={{
                  gap: 16,
                  padding: '20px 0',
                  borderBottom: '1px solid var(--hairline)',
                }}
              >
                <div className="stack" style={{ gap: 6, minWidth: 240, flex: 1 }}>
                  <div className="row gap-md wrap">
                    <span
                      className={`badge badge-${b.status === 'published' ? 'published' : 'draft'}`}
                    >
                      {b.status}
                    </span>
                    <span className="chip-tag">{b.category}</span>
                  </div>
                  <Link to={`/blogs/${b._id}`}>
                    <h3 className="t-feature-heading">{b.title}</h3>
                  </Link>
                  <span className="t-caption text-muted">
                    Updated {formatDate(b.updatedAt)} · ♥ {b.likeCount} · 💬 {b.commentCount}
                  </span>
                </div>
                <div className="row gap-md wrap">
                  <button className="btn btn-outline" onClick={() => togglePublish(b)}>
                    {b.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <Link to={`/edit/${b._id}`} className="btn btn-outline">
                    Edit
                  </Link>
                  <button className="btn btn-danger" onClick={() => remove(b._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
