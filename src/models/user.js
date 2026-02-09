/**
 * User model definition
 */

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.status = data.status || 'active';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Check if user is active
   * @returns {boolean} True if user status is active
   */
  isActive() {
    return this.status === 'active';
  }

  /**
   * Deactivate user account
   */
  deactivate() {
    this.status = 'inactive';
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Get user age in days
   * @returns {number} Days since account creation
   */
  getAccountAge() {
    const created = new Date(this.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON representation of user
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
