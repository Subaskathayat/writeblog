import sanitizeHtml from 'sanitize-html';

// Allow a reasonable set of formatting tags for blog content while stripping scripts.
export const cleanContent = (dirty = '') =>
  sanitizeHtml(dirty, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title'],
      a: ['href', 'name', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'data', 'mailto'],
  });

// Strip all tags for short text fields (title, excerpt, comments).
export const cleanText = (dirty = '') =>
  sanitizeHtml(dirty, { allowedTags: [], allowedAttributes: {} }).trim();
