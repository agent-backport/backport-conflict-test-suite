/**
 * Database configuration
 */

const config = {
  development: {
    host: 'localhost',
    port: 5432,
    database: 'app_dev',
    user: 'dev_user',
    password: 'dev_password',
    pool: {
      min: 2,
      max: 10
    }
  },
  production: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'app_prod',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    pool: {
      min: 5,
      max: 20
    },
    ssl: true
  },
  test: {
    host: 'localhost',
    port: 5432,
    database: 'app_test',
    user: 'test_user',
    password: 'test_password',
    pool: {
      min: 1,
      max: 5
    }
  }
};

/**
 * Get database configuration for current environment
 * @returns {Object} Database configuration object
 */
function getDatabaseConfig() {
  const env = process.env.NODE_ENV || 'development';
  return config[env] || config.development;
}

module.exports = {
  getDatabaseConfig,
  config
};
