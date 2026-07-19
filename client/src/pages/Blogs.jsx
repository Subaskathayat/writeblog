import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import BlogCard from '../components/BlogCard.jsx';
import Spinner from '../components/Spinner.jsx';

const CATEGORIES = [
  'Technology', 'Lifestyle', 'Travel', 'Food', 'Business',
  'Health', 'Education', 'Sports', 'Entertainment', 'Science',
];

export default function Blogs() {
  const [params, setParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(params.get('search') || '');

  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') || '1', 10);

  const update = useCallback(
    (next) => {
      const merged = { search, category, page: 1, ...next };
      const clean = {};
      Object.entries(merged).forEach(([k, v]) => {
        if (v && !(k === 'page' && v === 1)) clean[k] = v;
      });
      setParams(clean);
    },
    [search, category, setParams]
  );

  useEffect(() => {
    setLoading(true);
    api
      .get('/blogs', { params: { search, category, page, limit: 9 } })
      .then((res) => {
        setBlogs(res.data.blogs);
        setPageInfo({ page: res.data.page, pages: res.data.pages, total: res.data.total });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, page]);

  const onSearch = (e) => {
    e.preventDefault();
    update({ search: searchInput.trim() });
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="t-section-heading">Explore</h1>
        <p className="t-body-large text-muted mt-sm">
          {pageInfo.total} published {pageInfo.total === 1 ? 'story' : 'stories'}
        </p>

        {/* Search */}
        <form className="mt-xl" onSubmit={onSearch}>
          <div className="row gap-md wrap">
            <input
              className="input"
              style={{ maxWidth: 420 }}
              placeholder="Search stories…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              Search
            </button>
            {search && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSearchInput('');
                  update({ search: '' });
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Category chips */}
        <div className="row gap-sm wrap mt-xl">
          <button
            className={`chip ${!category ? 'is-active' : ''}`}
            onClick={() => update({ category: '' })}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? 'is-active' : ''}`}
              onClick={() => update({ category: c })}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mt-xxl">
          {loading ? (
            <Spinner full />
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <p className="t-feature-heading">No stories found.</p>
              <p className="mt-sm">Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {blogs.map((b) => (
                <BlogCard key={b._id} blog={b} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pageInfo.pages > 1 && (
          <div className="row center gap-md mt-xxl">
            <button
              className="btn btn-outline"
              disabled={page <= 1}
              onClick={() => update({ page: page - 1 })}
            >
              ← Prev
            </button>
            <span className="t-caption text-muted">
              Page {pageInfo.page} of {pageInfo.pages}
            </span>
            <button
              className="btn btn-outline"
              disabled={page >= pageInfo.pages}
              onClick={() => update({ page: page + 1 })}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
