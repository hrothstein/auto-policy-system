import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a UUID
 */
export function generateUUID() {
  return uuidv4();
}

/**
 * Generate a policy number in AUTO-XXXXX format
 */
let policyCounter = 0;
export function generatePolicyNumber() {
  policyCounter++;
  return `AUTO-${String(policyCounter).padStart(5, '0')}`;
}

/**
 * Reset policy counter (used when resetting demo data)
 */
export function resetPolicyCounter() {
  policyCounter = 0;
}

