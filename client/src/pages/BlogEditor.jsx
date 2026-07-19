import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';

const CATEGORIES = [
  'Technology', 'Lifestyle', 'Travel', 'Food', 'Business',
  'Health', 'Education', 'Sports', 'Entertainment', 'Science',
];

const EMPTY = {
  title: '',
  content: '',
  excerpt: '',
  featuredImage: '',
  category: 'Technology',
  tags: '',
  status: 'draft',
};

export default function BlogEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/blogs/${id}`)
      .then((res) => {
        const b = res.data.blog;
        setForm({
          title: b.title || '',
          content: b.content || '',
          excerpt: b.excerpt || '',
          featuredImage: b.featuredImage || '',
          category: b.category || 'Technology',
          tags: (b.tags || []).join(', '),
          status: b.status || 'draft',
        });
      })
      .catch((err) => {
        toast.error(err.message);
        navigate('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate, toast]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.content.trim()) e.content = 'Content is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (status) => {
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, status };
    try {
      if (isEdit) {
        await api.put(`/blogs/${id}`, payload);
        toast.success(status === 'published' ? 'Blog published' : 'Draft saved');
      } else {
        await api.post('/blogs', payload);
        toast.success(status === 'published' ? 'Blog published' : 'Draft saved');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner full />;

  return (
    <section className="section">
      <div className="container-narrow">
        <Link to="/dashboard" className="btn btn-secondary">
          ← Back to dashboard
        </Link>
        <h1 className="t-section-heading mt-md">{isEdit ? 'Edit blog' : 'Write a blog'}</h1>

        <form className="mt-xl" onSubmit={(e) => e.preventDefault()}>
          <div className={`field ${errors.title ? 'has-error' : ''}`}>
            <label>Title</label>
            <input
              className="input"
              value={form.title}
              onChange={set('title')}
              placeholder="An interesting headline"
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="two-col">
            <div className="field">
              <label>Category</label>
              <select className="select" value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Tags (comma separated)</label>
              <input
                className="input"
                value={form.tags}
                onChange={set('tags')}
                placeholder="react, design, ideas"
              />
            </div>
          </div>

          <div className="field">
            <label>Featured image URL</label>
            <input
              className="input"
              value={form.featuredImage}
              onChange={set('featuredImage')}
              placeholder="https://…"
            />
          </div>

          <div className="field">
            <label>Excerpt (short summary)</label>
            <input
              className="input"
              value={form.excerpt}
              onChange={set('excerpt')}
              maxLength={300}
              placeholder="A one-line teaser shown on cards"
            />
          </div>

          <div className={`field ${errors.content ? 'has-error' : ''}`}>
            <label>Content</label>
            <textarea
              className="textarea"
              style={{ minHeight: 320 }}
              value={form.content}
              onChange={set('content')}
              placeholder="Write your story… Basic HTML is supported."
            />
            {errors.content && <span className="field-error">{errors.content}</span>}
          </div>

          <div className="row gap-md wrap mt-lg">
            <button className="btn btn-primary" onClick={() => save('published')} disabled={saving}>
              {saving ? 'Saving…' : 'Publish'}
            </button>
            <button className="btn btn-outline" onClick={() => save('draft')} disabled={saving}>
              Save as draft
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
