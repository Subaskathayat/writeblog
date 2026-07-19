export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function initialsAvatar(username = '?') {
  return username.charAt(0).toUpperCase();
}
