import mongoose from 'mongoose';
import { CATEGORIES } from '../config/constants.js';

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must be at most 200 characters'],
    },
    content: { type: String, required: [true, 'Content is required'] },
    excerpt: { type: String, default: '', maxlength: 300 },
    featuredImage: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },
    tags: [{ type: String, trim: true }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

blogSchema.index({ title: 'text', content: 'text', excerpt: 'text', tags: 'text' });

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
