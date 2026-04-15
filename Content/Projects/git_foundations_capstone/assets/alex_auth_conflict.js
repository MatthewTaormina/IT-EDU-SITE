// auth.js — authentication helpers
// Updated by Alex Kim · 2026-04-14
// PR #61 — wire up token validation against the dev token registry

const VALID_TOKENS = new Set([
  "swl_token_dev_001",
  "swl_token_dev_002",
  "swl_token_staging_001",
]);

/**
 * Check whether a request carries a valid authentication token.
 * @param {string} token
 * @returns {boolean}
 */
function checkAuth(token) {
  if (!token || typeof token !== "string") return false;
  return validateToken(token);
}

/**
 * Validate a token against the known token registry.
 * @param {string} token
 * @returns {boolean}
 */
function validateToken(token) {
  return VALID_TOKENS.has(token);
}

module.exports = { checkAuth, validateToken };
