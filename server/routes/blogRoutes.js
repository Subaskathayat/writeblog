import express from 'express';
import { body } from 'express-validator';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  deleteComment,
  getMyBlogs,
} from '../controllers/blogController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { CATEGORIES } from '../config/constants.js';

const router = express.Router();

const blogValidators = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').isIn(CATEGORIES).withMessage('A valid category is required'),
];

router.get('/', getBlogs);
router.get('/mine', protect, getMyBlogs);
router.get('/:id', optionalAuth, getBlogById);

router.post('/', protect, blogValidators, validate, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

router.put('/:id/like', protect, toggleLike);

router.post(
  '/:id/comments',
  protect,
  [body('text').trim().notEmpty().withMessage('Comment cannot be empty').isLength({ max: 1000 })],
  validate,
  addComment
);
router.delete('/:id/comments/:commentId', protect, deleteComment);

export default router;
