/**
 * Validate required fields in an object
 */
export function validateRequired(obj, requiredFields) {
  const missing = [];
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      missing.push(field);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate state code (2 letters)
 */
export function isValidStateCode(state) {
  return typeof state === 'string' && state.length === 2 && /^[A-Z]{2}$/.test(state);
}

/**
 * Validate ZIP code (5 digits)
 */
export function isValidZipCode(zip) {
  return typeof zip === 'string' && zip.length === 5 && /^\d{5}$/.test(zip);
}

/**
 * Validate VIN (17 characters, alphanumeric)
 */
export function isValidVIN(vin) {
  return typeof vin === 'string' && vin.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
}

/**
 * Validate date string (ISO format)
 */
export function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate policy status
 */
export function isValidPolicyStatus(status) {
  return ['ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING'].includes(status);
}

