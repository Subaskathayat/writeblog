import express from 'express';
import { CATEGORIES } from '../config/constants.js';

const router = express.Router();

router.get('/', (req, res) => res.json({ categories: CATEGORIES }));

export default router;
