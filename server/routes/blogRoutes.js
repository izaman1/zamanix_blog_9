import express from 'express';
import multer from 'multer';
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
} from '../controllers/blogController.js';

const router = express.Router();

// Get all blogs
router.get('/', getBlogs);

// Get blog by slug or ID
router.get('/:slug', getBlogBySlug);

// Create new blog
router.post('/', (req, res, next) => {
  req.upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || 'File upload error'
      });
    }
    next();
  });
}, createBlog);

// Update blog
router.put('/:id', (req, res, next) => {
  req.upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || 'File upload error'
      });
    }
    next();
  });
}, updateBlog);

// Delete blog
router.delete('/:id', deleteBlog);

export default router;