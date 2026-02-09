const { sanitizeInput } = require('../utils/validation');

/**
 * Post API endpoints
 * Handles blog post creation and management
 */

const posts = new Map();
let nextPostId = 1;

/**
 * Create a new post
 * @param {Object} postData - Post data including title and content
 * @returns {Object} Created post object
 */
function createPost(postData) {
  const { title, content, authorId } = postData;

  if (!title || title.length < 3) {
    throw new Error('Title must be at least 3 characters');
  }

  const post = {
    id: nextPostId++,
    title: sanitizeInput(title),
    content: sanitizeInput(content),
    authorId,
    createdAt: new Date().toISOString(),
    published: false
  };

  posts.set(post.id, post);
  return post;
}

/**
 * Get post by ID
 * @param {number} id - Post ID
 * @returns {Object|null} Post object or null if not found
 */
function getPostById(id) {
  return posts.get(id) || null;
}

/**
 * Publish a post
 * @param {number} id - Post ID
 * @returns {Object|null} Updated post or null if not found
 */
function publishPost(id) {
  const post = posts.get(id);
  if (!post) return null;

  post.published = true;
  post.publishedAt = new Date().toISOString();
  return post;
}

/**
 * List posts with optional filtering and sorting
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Sorting and pagination options
 * @returns {Array} Array of post objects
 */
function listPosts(filters = {}, options = {}) {
  let postList = Array.from(posts.values());

  if (filters.authorId) {
    postList = postList.filter(p => p.authorId === filters.authorId);
  }

  if (filters.published !== undefined) {
    postList = postList.filter(p => p.published === filters.published);
  }

  // v1.0: Added sorting support
  if (options.sortBy === 'date') {
    postList.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  // v1.0: Added pagination support
  if (options.limit) {
    postList = postList.slice(0, options.limit);
  }

  return postList;
}

module.exports = {
  createPost,
  getPostById,
  publishPost,
  listPosts
};
