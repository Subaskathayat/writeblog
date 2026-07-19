import User from '../models/User.js';
import Blog from '../models/Blog.js';

// GET /api/users/:id  (public author profile + published blog count)
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select('username bio avatar createdAt');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const publishedCount = await Blog.countDocuments({
    author: user._id,
    status: 'published',
  });
  res.json({ user, publishedCount });
};
