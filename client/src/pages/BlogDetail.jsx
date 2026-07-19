import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Avatar from '../components/Avatar.jsx';
import LikeButton from '../components/LikeButton.jsx';
import Spinner from '../components/Spinner.jsx';
import { formatDate } from '../utils/format.js';

export default function BlogDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/blogs/${id}`)
      .then((res) => {
        const b = res.data.blog;
        setBlog(b);
        setComments(b.comments || []);
        setLikeCount(b.likeCount ?? b.likes?.length ?? 0);
        if (user) setLiked((b.likes || []).some((u) => (u._id || u) === user._id));
      })
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [id, user]);

  const toggleLike = async () => {
    if (!user) return navigate('/login', { state: { from: `/blogs/${id}` } });
    setLikeBusy(true);
    try {
      const { data } = await api.put(`/blogs/${id}/like`);
      setLiked(data.liked);
      setLikeCount(data.likes);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLikeBusy(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/blogs/${id}/comments`, { text: commentText });
      setComments((c) => [...c, data.comment]);
      setCommentText('');
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/blogs/${id}/comments/${commentId}`);
      setComments((c) => c.filter((x) => x._id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner full />;
  if (!blog) {
    return (
      <div className="empty-state section">
        <p className="t-feature-heading">Story not found.</p>
        <Link to="/blogs" className="btn btn-primary mt-lg">
          Back to explore
        </Link>
      </div>
    );
  }

  const author = blog.author || {};
  const isOwner = user && author._id === user._id;

  return (
    <article className="section">
      <div className="container-narrow">
        <Link to="/blogs" className="btn btn-secondary">
          ← Back
        </Link>

        <div className="row gap-md mt-lg wrap">
          <span className="chip">{blog.category}</span>
          {blog.status === 'draft' && <span className="badge badge-draft">Draft</span>}
        </div>

        <h1 className="t-product-display mt-md">{blog.title}</h1>

        {/* Byline */}
        <div className="row between wrap mt-xl" style={{ gap: 16 }}>
          <Link to={`/author/${author._id}`} className="row gap-md" style={{ color: 'inherit' }}>
            <Avatar user={author} size={32} />
            <div className="stack">
              <span style={{ fontWeight: 500 }}>{author.username}</span>
              <span className="t-caption text-muted">{formatDate(blog.createdAt)}</span>
            </div>
          </Link>
          <div className="row gap-md">
            <LikeButton liked={liked} count={likeCount} onToggle={toggleLike} disabled={likeBusy} />
            {isOwner && (
              <Link to={`/edit/${blog._id}`} className="btn btn-outline">
                Edit
              </Link>
            )}
          </div>
        </div>

        {blog.featuredImage && (
          <img
            src={blog.featuredImage}
            alt={blog.title}
            style={{ width: '100%', borderRadius: 'var(--r-lg)', margin: '32px 0' }}
          />
        )}

        {/* Content */}
        <div
          className="prose mt-xl"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="row gap-sm wrap mt-xxl">
            {blog.tags.map((t) => (
              <span key={t} className="chip-tag">
                #{t}
              </span>
            ))}
          </div>
        )}

        <hr className="divider" style={{ margin: '48px 0 32px' }} />

        {/* Comments */}
        <section>
          <h2 className="t-card-heading">
            Comments <span className="text-muted">({comments.length})</span>
          </h2>

          {user ? (
            <form className="mt-lg" onSubmit={submitComment}>
              <textarea
                className="textarea"
                placeholder="Add a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={1000}
              />
              <button className="btn btn-primary mt-md" type="submit" disabled={posting}>
                {posting ? 'Posting…' : 'Post comment'}
              </button>
            </form>
          ) : (
            <p className="mt-lg text-muted">
              <Link to="/login" className="btn btn-secondary">
                Log in
              </Link>{' '}
              to join the conversation.
            </p>
          )}

          <div className="mt-xl">
            {comments.length === 0 ? (
              <p className="text-muted">No comments yet. Be the first.</p>
            ) : (
              comments.map((c) => {
                const cu = c.user || {};
                const canDelete = user && (cu._id === user._id || isOwner);
                return (
                  <div className="comment" key={c._id}>
                    <Avatar user={cu} size={24} />
                    <div className="stack" style={{ flex: 1, gap: 4 }}>
                      <div className="row gap-sm wrap">
                        <span style={{ fontWeight: 500 }}>{cu.username || 'User'}</span>
                        <span className="t-micro text-muted">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="t-body">{c.text}</p>
                      {canDelete && (
                        <button
                          className="btn btn-danger"
                          style={{ alignSelf: 'flex-start' }}
                          onClick={() => deleteComment(c._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </article>
  );
}
