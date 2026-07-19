export default function Avatar({ user, size = 32 }) {
  const cls = `avatar avatar-${size}`;
  const name = user?.username || '?';
  if (user?.avatar) {
    return (
      <span className={cls}>
        <img src={user.avatar} alt={name} />
      </span>
    );
  }
  return <span className={cls}>{name.charAt(0)}</span>;
}
