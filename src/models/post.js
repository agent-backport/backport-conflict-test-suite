/**
 * Post model definition
 */

class Post {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.authorId = data.authorId;
    this.published = data.published || false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.publishedAt = data.publishedAt || null;
  }

  /**
   * Check if post is published
   * @returns {boolean} True if post is published
   */
  isPublished() {
    return this.published;
  }

  /**
   * Publish the post
   */
  publish() {
    this.published = true;
    this.publishedAt = new Date().toISOString();
  }

  /**
   * Get post excerpt
   * @param {number} length - Maximum length of excerpt
   * @returns {string} Post excerpt
   */
  getExcerpt(length = 100) {
    if (this.content.length <= length) return this.content;
    return this.content.substring(0, length) + '...';
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON representation of post
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      authorId: this.authorId,
      published: this.published,
      createdAt: this.createdAt,
      publishedAt: this.publishedAt
    };
  }
}

module.exports = Post;
