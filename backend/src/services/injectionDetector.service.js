const { OVERRIDE_PATTERNS } = require('../config/constants');

class InjectionDetectorService {
  /**
   * Scans text and payload context for adversarial prompt injection and policy override keywords.
   * @param {string} promptText 
   * @param {object} context 
   * @returns {{ detected: boolean, patterns: string[] }}
   */
  static scan(promptText = '', context = {}) {
    const combined = `${promptText} ${JSON.stringify(context || {})}`;
    const detectedPatterns = [];

    for (const pattern of OVERRIDE_PATTERNS) {
      if (pattern.test(combined)) {
        detectedPatterns.push(pattern.source);
      }
    }

    return {
      detected: detectedPatterns.length > 0,
      patterns: detectedPatterns,
    };
  }
}

module.exports = InjectionDetectorService;
