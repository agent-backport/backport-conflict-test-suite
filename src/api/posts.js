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
 * Publish a post (v2.0 - with validation)
 * @param {number} id - Post ID
 * @returns {Object|null} Updated post or null if not found
 * @throws {Error} If post content is too short
 */
function publishPost(id) {
  const post = posts.get(id);
  if (!post) return null;

  // v2.0: Validate content before publishing
  if (!post.content || post.content.length < 100) {
    throw new Error('Cannot publish: content must be at least 100 characters');
  }

  post.published = true;
  post.publishedAt = new Date().toISOString();
  post.reviewedBy = 'automated-system-v2';
  return post;
}

/**
 * List posts with optional filtering
 * @param {Object} filters - Filter criteria
 * @returns {Array} Array of post objects
 */
function listPosts(filters = {}) {
  let postList = Array.from(posts.values());

  if (filters.authorId) {
    postList = postList.filter(p => p.authorId === filters.authorId);
  }

  if (filters.published !== undefined) {
    postList = postList.filter(p => p.published === filters.published);
  }

  return postList;
}

module.exports = {
  createPost,
  getPostById,
  publishPost,
  listPosts
};
