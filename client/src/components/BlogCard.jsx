import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { formatDate } from '../utils/format.js';

export default function BlogCard({ blog }) {
  const author = blog.author || {};
  return (
    <article className="blog-card">
      <Link to={`/blogs/${blog._id}`} className="blog-card-thumb">
        {blog.featuredImage ? (
          <img src={blog.featuredImage} alt={blog.title} loading="lazy" />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: '0.28px',
            }}
          >
            {blog.category}
          </div>
        )}
      </Link>
      <div className="blog-card-body">
        <span className="chip" style={{ alignSelf: 'flex-start' }}>
          {blog.category}
        </span>
        <Link to={`/blogs/${blog._id}`}>
          <h3 className="blog-card-title">{blog.title}</h3>
        </Link>
        {blog.excerpt && <p className="blog-card-excerpt">{blog.excerpt}</p>}
        <div className="blog-card-meta">
          <Link
            to={`/author/${author._id}`}
            className="row gap-xs"
            style={{ color: 'inherit' }}
          >
            <Avatar user={author} size={24} />
            <span>{author.username}</span>
          </Link>
          <span>·</span>
          <span>{formatDate(blog.createdAt)}</span>
          <span style={{ marginLeft: 'auto' }}>♥ {blog.likeCount ?? 0}</span>
          <span>💬 {blog.commentCount ?? 0}</span>
        </div>
      </div>
    </article>
  );
}
