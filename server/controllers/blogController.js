import Blog from '../models/Blog.js';
import { cleanContent, cleanText } from '../utils/sanitize.js';
import { CATEGORIES } from '../config/constants.js';

const AUTHOR_FIELDS = 'username avatar bio';

// GET /api/blogs  (public list of published blogs, with search/filter/pagination)
export const getBlogs = async (req, res) => {
  const { search, category, author, page = 1, limit = 9, sort = 'recent' } = req.query;
  const query = { status: 'published' };

  if (category && CATEGORIES.includes(category)) query.category = category;
  if (author) query.author = author;
  if (search) query.$text = { $search: search };

  const sortMap = {
    recent: { createdAt: -1 },
    oldest: { createdAt: 1 },
    title: { title: 1 },
  };

  const pageNum = Math.max(1, parseInt(page, 10));
  const perPage = Math.min(50, Math.max(1, parseInt(limit, 10)));

  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .populate('author', AUTHOR_FIELDS)
      .sort(sortMap[sort] || sortMap.recent)
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .lean(),
    Blog.countDocuments(query),
  ]);

  res.json({
    blogs: blogs.map(withCounts),
    page: pageNum,
    pages: Math.ceil(total / perPage),
    total,
  });
};

// GET /api/blogs/:id
export const getBlogById = async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate('author', AUTHOR_FIELDS)
    .populate('comments.user', 'username avatar');
  if (!blog) return res.status(404).json({ message: 'Blog not found' });

  // Drafts are only visible to their author.
  const isOwner = req.user && blog.author._id.equals(req.user._id);
  if (blog.status === 'draft' && !isOwner) {
    return res.status(404).json({ message: 'Blog not found' });
  }
  res.json({ blog: withCounts(blog.toObject()) });
};

// POST /api/blogs
export const createBlog = async (req, res) => {
  const { title, content, excerpt, featuredImage, category, tags, status } = req.body;
  const blog = await Blog.create({
    title: cleanText(title),
    content: cleanContent(content),
    excerpt: cleanText(excerpt || ''),
    featuredImage: (featuredImage || '').trim(),
    category,
    tags: normalizeTags(tags),
    status: status === 'published' ? 'published' : 'draft',
    author: req.user._id,
  });
  const populated = await blog.populate('author', AUTHOR_FIELDS);
  res.status(201).json({ blog: withCounts(populated.toObject()) });
};

// PUT /api/blogs/:id
export const updateBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  if (!blog.author.equals(req.user._id)) {
    return res.status(403).json({ message: 'You can only edit your own blogs' });
  }

  const { title, content, excerpt, featuredImage, category, tags, status } = req.body;
  if (title !== undefined) blog.title = cleanText(title);
  if (content !== undefined) blog.content = cleanContent(content);
  if (excerpt !== undefined) blog.excerpt = cleanText(excerpt);
  if (featuredImage !== undefined) blog.featuredImage = featuredImage.trim();
  if (category !== undefined) blog.category = category;
  if (tags !== undefined) blog.tags = normalizeTags(tags);
  if (status !== undefined) blog.status = status === 'published' ? 'published' : 'draft';

  await blog.save();
  const populated = await blog.populate('author', AUTHOR_FIELDS);
  res.json({ blog: withCounts(populated.toObject()) });
};

// DELETE /api/blogs/:id
export const deleteBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  const isOwner = blog.author.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You can only delete your own blogs' });
  }
  await blog.deleteOne();
  res.json({ message: 'Blog deleted' });
};

// PUT /api/blogs/:id/like  (toggle)
export const toggleLike = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Blog not found' });

  const idx = blog.likes.findIndex((u) => u.equals(req.user._id));
  if (idx === -1) blog.likes.push(req.user._id);
  else blog.likes.splice(idx, 1);
  await blog.save();

  res.json({ likes: blog.likes.length, liked: idx === -1 });
};

// POST /api/blogs/:id/comments
export const addComment = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Blog not found' });

  blog.comments.push({ user: req.user._id, text: cleanText(req.body.text) });
  await blog.save();
  await blog.populate('comments.user', 'username avatar');

  const comment = blog.comments[blog.comments.length - 1];
  res.status(201).json({ comment });
};

// DELETE /api/blogs/:id/comments/:commentId
export const deleteComment = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Blog not found' });

  const comment = blog.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  const isCommentOwner = comment.user.equals(req.user._id);
  const isBlogOwner = blog.author.equals(req.user._id);
  if (!isCommentOwner && !isBlogOwner && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not allowed to delete this comment' });
  }
  comment.deleteOne();
  await blog.save();
  res.json({ message: 'Comment deleted' });
};

// GET /api/blogs/mine  (dashboard: current user's blogs + stats)
export const getMyBlogs = async (req, res) => {
  const blogs = await Blog.find({ author: req.user._id })
    .sort({ updatedAt: -1 })
    .lean();

  const stats = {
    total: blogs.length,
    published: blogs.filter((b) => b.status === 'published').length,
    drafts: blogs.filter((b) => b.status === 'draft').length,
    likesReceived: blogs.reduce((sum, b) => sum + (b.likes?.length || 0), 0),
  };
  res.json({ blogs: blogs.map(withCounts), stats });
};

// helpers
function withCounts(blog) {
  return {
    ...blog,
    likeCount: blog.likes ? blog.likes.length : 0,
    commentCount: blog.comments ? blog.comments.length : 0,
  };
}

function normalizeTags(tags) {
  if (!tags) return [];
  const arr = Array.isArray(tags) ? tags : String(tags).split(',');
  return arr.map((t) => cleanText(String(t)).toLowerCase()).filter(Boolean).slice(0, 15);
}
