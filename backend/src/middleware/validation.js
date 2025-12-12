import { validateRequired, isValidUUID, isValidStateCode, isValidZipCode, isValidVIN, isValidDate, isValidPolicyStatus } from '../utils/validators.js';

/**
 * Validate driver data
 */
export function validateDriver(req, res, next) {
  try {
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'licenseNumber', 'licenseState', 'licenseExpiration', 'pointsOnLicense', 'accidentsCount'];
    validateRequired(req.body, requiredFields);

    if (!isValidDate(req.body.dateOfBirth)) {
      throw new Error('Invalid dateOfBirth format');
    }
    if (!isValidDate(req.body.licenseExpiration)) {
      throw new Error('Invalid licenseExpiration format');
    }
    if (!isValidStateCode(req.body.licenseState)) {
      throw new Error('Invalid licenseState format (must be 2 uppercase letters)');
    }
    if (typeof req.body.pointsOnLicense !== 'number' || req.body.pointsOnLicense < 0 || req.body.pointsOnLicense > 10) {
      throw new Error('pointsOnLicense must be a number between 0 and 10');
    }
    if (typeof req.body.accidentsCount !== 'number' || req.body.accidentsCount < 0 || req.body.accidentsCount > 5) {
      throw new Error('accidentsCount must be a number between 0 and 5');
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Validate vehicle data
 */
export function validateVehicle(req, res, next) {
  try {
    const requiredFields = ['year', 'make', 'model', 'vin', 'plate', 'plateState'];
    validateRequired(req.body, requiredFields);

    if (typeof req.body.year !== 'number' || req.body.year < 1990 || req.body.year > 2025) {
      throw new Error('year must be a number between 1990 and 2025');
    }
    if (!isValidVIN(req.body.vin)) {
      throw new Error('Invalid VIN format (must be 17 alphanumeric characters)');
    }
    if (!isValidStateCode(req.body.plateState)) {
      throw new Error('Invalid plateState format (must be 2 uppercase letters)');
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Validate policy data
 */
export function validatePolicy(req, res, next) {
  try {
    const requiredFields = ['address', 'city', 'state', 'zipCode', 'premium', 'effectiveDate', 'terminationDate', 'policyValue', 'status'];
    validateRequired(req.body, requiredFields);

    if (!isValidStateCode(req.body.state)) {
      throw new Error('Invalid state format (must be 2 uppercase letters)');
    }
    if (!isValidZipCode(req.body.zipCode)) {
      throw new Error('Invalid zipCode format (must be 5 digits)');
    }
    if (!isValidDate(req.body.effectiveDate)) {
      throw new Error('Invalid effectiveDate format');
    }
    if (!isValidDate(req.body.terminationDate)) {
      throw new Error('Invalid terminationDate format');
    }
    if (typeof req.body.premium !== 'number' || req.body.premium < 0) {
      throw new Error('premium must be a positive number');
    }
    if (typeof req.body.policyValue !== 'number' || req.body.policyValue < 0) {
      throw new Error('policyValue must be a positive number');
    }
    if (!isValidPolicyStatus(req.body.status)) {
      throw new Error('status must be one of: ACTIVE, CANCELLED, EXPIRED, PENDING');
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Validate UUID parameter
 */
export function validateUUID(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName} format (must be UUID)`
      });
    }
    next();
  };
}

