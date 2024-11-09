import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    url: String,
    publicId: String
  },
  author: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  slug: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Create URL-friendly slug from title and ID
blogSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('title')) {
    // Create base slug from title
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Add first 6 characters of _id to make it unique
    this.slug = `${this._id.toString().slice(0, 6)}-${baseSlug}`;
  }
  next();
});

// Virtual for full URL
blogSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;