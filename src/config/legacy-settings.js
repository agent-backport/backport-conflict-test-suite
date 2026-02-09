/**
 * Legacy settings and configuration
 * @deprecated This file contains old configuration format
 * Will be removed in future versions
 */

const legacySettings = {
  apiVersion: '1.0',
  useOldAuth: true,
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  sessionTimeout: 3600000, // 1 hour
  enableDebugMode: false,
  oldStyleRouting: true,
  deprecatedFeatures: {
    xmlSupport: true,
    soapApi: true,
    legacyPasswordHash: true
  }
};

/**
 * Get legacy setting value
 * @param {string} key - Setting key
 * @returns {any} Setting value
 */
function getLegacySetting(key) {
  return legacySettings[key];
}

/**
 * Check if feature is enabled
 * @param {string} feature - Feature name
 * @returns {boolean} True if feature is enabled
 */
function isLegacyFeatureEnabled(feature) {
  return legacySettings.deprecatedFeatures[feature] === true;
}

module.exports = {
  legacySettings,
  getLegacySetting,
  isLegacyFeatureEnabled
};
