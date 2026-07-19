export default function LikeButton({ liked, count, onToggle, disabled }) {
  return (
    <button
      type="button"
      className={`like-btn ${liked ? 'is-liked' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      <span className="heart">{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
    </button>
  );
}
