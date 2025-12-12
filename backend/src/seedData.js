/**
 * Seed Data Generator for Auto Policy System
 * 
 * Customer data aligns with bankingcoredemo repository:
 * https://github.com/hrothstein/bankingcoredemo
 * 
 * Uses the same customer name arrays and patterns from bankingcoredemo
 * to ensure consistency across demo systems.
 */
import { generateUUID, generatePolicyNumber, resetPolicyCounter } from './utils/generators.js';
import { driverStore, vehicleStore, policiesStore, policyDriverRelations, policyVehicleRelations, resetDataStore } from './datastore.js';

// Vehicle make/model distributions
const VEHICLE_MAKES = {
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot'],
  'Ford': ['F-150', 'Escape', 'Explorer', 'Mustang'],
  'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Tahoe'],
  'BMW': ['3 Series', '5 Series', 'X3', 'X5'],
  'Mercedes': ['C-Class', 'E-Class', 'GLC', 'GLE'],
  'Other': ['Elantra', 'Optima', 'Altima', 'Rogue']
};

const MAKE_WEIGHTS = [
  { make: 'Toyota', weight: 0.25 },
  { make: 'Honda', weight: 0.20 },
  { make: 'Ford', weight: 0.15 },
  { make: 'Chevrolet', weight: 0.15 },
  { make: 'BMW', weight: 0.10 },
  { make: 'Mercedes', weight: 0.10 },
  { make: 'Other', weight: 0.05 }
];

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random date between min and max years ago
 */
function generateDateOfBirth(minYearsAgo, maxYearsAgo) {
  const now = new Date();
  const minDate = new Date(now.getFullYear() - maxYearsAgo, 0, 1);
  const maxDate = new Date(now.getFullYear() - minYearsAgo, 11, 31);
  const randomTime = minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
}

/**
 * Generate a future date (1-5 years out)
 */
function generateFutureDate(minYears, maxYears) {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setFullYear(now.getFullYear() + randomInt(minYears, maxYears));
  return futureDate.toISOString().split('T')[0];
}

/**
 * Generate a license number
 */
function generateLicenseNumber(state) {
  return `${state}${Math.random().toString().slice(2, 10)}`;
}

/**
 * Generate a VIN (17 characters)
 */
function generateVIN() {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = '';
  for (let i = 0; i < 17; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)];
  }
  return vin;
}

/**
 * Generate a license plate
 */
function generatePlate() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let plate = '';
  for (let i = 0; i < 3; i++) {
    plate += letters[Math.floor(Math.random() * letters.length)];
  }
  for (let i = 0; i < 4; i++) {
    plate += numbers[Math.floor(Math.random() * numbers.length)];
  }
  return plate;
}

/**
 * Select a random make based on distribution weights
 */
function selectRandomMake() {
  const rand = Math.random();
  let cumulative = 0;
  for (const item of MAKE_WEIGHTS) {
    cumulative += item.weight;
    if (rand <= cumulative) {
      return item.make;
    }
  }
  return MAKE_WEIGHTS[0].make;
}

/**
 * Generate vehicle year based on distribution
 */
function generateVehicleYear() {
  const rand = Math.random();
  if (rand < 0.40) {
    return randomInt(2020, 2025);
  } else if (rand < 0.75) {
    return randomInt(2015, 2019);
  } else if (rand < 0.95) {
    return randomInt(2010, 2014);
  } else {
    return randomInt(2005, 2009);
  }
}

/**
 * Fetch customer data from bankingcoredemo
 * Falls back to synthetic data if fetch fails
 */
async function fetchBankingCoreCustomers() {
  try {
    // Try common bankingcoredemo API endpoints
    // Bankingcoredemo runs on port 3001 (API) according to:
    // https://github.com/hrothstein/bankingcoredemo
    const possibleEndpoints = [
      'http://localhost:3001/api/v1/customers',
      'http://localhost:8080/api/v1/customers',
      'https://bankingcoredemo.herokuapp.com/api/v1/customers',
      process.env.BANKINGCORE_API_URL ? `${process.env.BANKINGCORE_API_URL}/api/v1/customers` : null
    ].filter(Boolean);

    for (const endpoint of possibleEndpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        if (response.ok) {
          const data = await response.json();
          // Transform bankingcoredemo customer data to our format
          // Handle different response formats: {data: [...]} or direct array
          const customers = Array.isArray(data) ? data : (data.data || data.customers || []);
          
          if (Array.isArray(customers) && customers.length > 0) {
            const transformed = customers.map(customer => ({
              firstName: customer.firstName || customer.first_name || extractFirstName(customer.username || customer.userName),
              lastName: customer.lastName || customer.last_name || extractLastName(customer.username || customer.userName),
              state: customer.state || customer.address?.state || customer.address?.stateCode || 'NY',
              address: customer.address?.street || customer.address?.streetAddress || customer.address || `${randomInt(100, 9999)} Main St`,
              city: customer.address?.city || customer.city || 'New York',
              zipCode: customer.address?.zipCode || customer.address?.zip || customer.zipCode || String(randomInt(10000, 99999))
            })).slice(0, 50); // Limit to 50 customers
            
            console.log(`✓ Fetched ${transformed.length} customers from bankingcoredemo API (${endpoint})`);
            return transformed;
          }
        }
      } catch (err) {
        // Try next endpoint
        continue;
      }
    }
    throw new Error('No bankingcoredemo API endpoint available');
  } catch (error) {
    console.log('ℹ Using synthetic customer data (bankingcoredemo fetch failed):', error.message);
    return null;
  }
}

/**
 * Extract first name from username pattern (e.g., "john.smith0" -> "John")
 */
function extractFirstName(username) {
  if (!username) return 'John';
  const parts = username.split('.');
  if (parts.length > 0) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  }
  return 'John';
}

/**
 * Extract last name from username pattern (e.g., "john.smith0" -> "Smith")
 */
function extractLastName(username) {
  if (!username) return 'Smith';
  const parts = username.split('.');
  if (parts.length > 1) {
    const lastNamePart = parts[1].replace(/\d+$/, ''); // Remove trailing numbers
    if (lastNamePart.length > 0) {
      return lastNamePart.charAt(0).toUpperCase() + lastNamePart.slice(1).toLowerCase();
    }
  }
  return 'Smith';
}

/**
 * Generate synthetic customer data matching bankingcoredemo patterns
 * Uses the exact same name arrays from bankingcoredemo repository:
 * https://github.com/hrothstein/bankingcoredemo/blob/main/data/seed-demo-data.js
 * 
 * Fully deterministic - same data every time for consistent demo experience
 */
function generateSyntheticCustomers(count = 50) {
  // Exact same name arrays from bankingcoredemo seed-demo-data.js
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA'];

  const customers = [];
  for (let i = 0; i < count; i++) {
    // Fully deterministic selection - same results every time
    // Uses same name arrays as bankingcoredemo
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const cityIndex = i % cities.length;
    
    // Deterministic address and zip code based on index for consistency
    const addressNumber = ((i * 137) % 9999) + 1; // Use prime multiplier for better distribution
    const zipCode = String(10000 + ((i * 7919) % 90000)); // Use prime for zip code
    
    customers.push({
      firstName,
      lastName,
      state: states[cityIndex],
      address: `${addressNumber} Main Street`, // Deterministic address
      city: cities[cityIndex],
      zipCode
    });
  }
  return customers;
}

/**
 * Generate a driver
 */
function generateDriver(customer, isPrimary = true) {
  return {
    id: generateUUID(),
    firstName: customer.firstName,
    lastName: customer.lastName,
    dateOfBirth: generateDateOfBirth(isPrimary ? 25 : 16, isPrimary ? 70 : 25),
    licenseNumber: generateLicenseNumber(customer.state),
    licenseState: customer.state,
    licenseExpiration: generateFutureDate(1, 5),
    pointsOnLicense: randomInt(0, 10),
    accidentsCount: randomInt(0, 5),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Generate a vehicle
 */
function generateVehicle(state) {
  const make = selectRandomMake();
  const models = VEHICLE_MAKES[make];
  const model = models[Math.floor(Math.random() * models.length)];
  const year = generateVehicleYear();

  return {
    id: generateUUID(),
    year,
    make,
    model,
    vin: generateVIN(),
    plate: generatePlate(),
    plateState: state,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Calculate premium based on vehicle and driver records
 */
function calculatePremium(vehicle, drivers) {
  let basePremium = 800;
  
  // Vehicle factors
  const vehicleAge = new Date().getFullYear() - vehicle.year;
  if (vehicleAge < 5) {
    basePremium += 200;
  } else if (vehicleAge < 10) {
    basePremium += 100;
  }

  // Luxury brands
  if (['BMW', 'Mercedes'].includes(vehicle.make)) {
    basePremium += 400;
  }

  // Driver factors
  const totalPoints = drivers.reduce((sum, d) => sum + d.pointsOnLicense, 0);
  const totalAccidents = drivers.reduce((sum, d) => sum + d.accidentsCount, 0);
  
  basePremium += totalPoints * 50;
  basePremium += totalAccidents * 200;

  // Multiple vehicles discount (if more than 1 vehicle, add 75% for each additional)
  // This is handled at policy level

  return Math.round(basePremium);
}

/**
 * Calculate policy value
 */
function calculatePolicyValue(premium) {
  // Policy value is typically 40-100x the annual premium
  const multiplier = randomInt(40, 100);
  return Math.round(premium * multiplier);
}

/**
 * Generate seed data
 */
export async function generateSeedData() {
  // Reset datastore
  resetDataStore();
  resetPolicyCounter();

  // Fetch or generate customers - prioritize bankingcoredemo API for same names
  let customers = await fetchBankingCoreCustomers();
  if (!customers || customers.length === 0) {
    console.log('ℹ Generating synthetic customers matching bankingcoredemo patterns');
    customers = generateSyntheticCustomers(50);
  } else {
    console.log(`✓ Using ${customers.length} customers from bankingcoredemo`);
  }

  // Generate 75 drivers (50 primary + 25 family members)
  const drivers = [];
  for (let i = 0; i < 50; i++) {
    drivers.push(generateDriver(customers[i], true));
  }
  
  // Generate 25 additional family members (deterministic)
  for (let i = 0; i < 25; i++) {
    const customerIndex = i % 50; // Deterministic selection
    drivers.push(generateDriver(customers[customerIndex], false));
  }

  // Generate 85 vehicles (deterministic)
  const vehicles = [];
  for (let i = 0; i < 85; i++) {
    const state = customers[i % 50].state; // Deterministic selection
    vehicles.push(generateVehicle(state));
  }

  // Store drivers and vehicles
  drivers.forEach(driver => driverStore.create(driver));
  vehicles.forEach(vehicle => vehicleStore.create(vehicle));

  // Generate 50 policies
  const policies = [];
  for (let i = 0; i < 50; i++) {
    const customer = customers[i];
    const primaryDriver = drivers[i];
    
    // Each policy gets 1-3 drivers (primary + 0-2 family members)
    const policyDrivers = [primaryDriver];
    const numAdditionalDrivers = randomInt(0, 2);
    for (let j = 0; j < numAdditionalDrivers; j++) {
      const familyDriver = drivers[50 + Math.floor(Math.random() * 25)];
      if (!policyDrivers.includes(familyDriver)) {
        policyDrivers.push(familyDriver);
      }
    }

    // Each policy gets 1-3 vehicles
    const numVehicles = randomInt(1, 3);
    const policyVehicles = [];
    for (let j = 0; j < numVehicles; j++) {
      const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
      if (!policyVehicles.includes(vehicle)) {
        policyVehicles.push(vehicle);
      }
    }

    // Calculate premium
    let premium = calculatePremium(policyVehicles[0], policyDrivers);
    // Add 75% for each additional vehicle
    for (let j = 1; j < policyVehicles.length; j++) {
      premium += Math.round(premium * 0.75);
    }

    const policyValue = calculatePolicyValue(premium);

    // Status distribution: 85% ACTIVE, 5% PENDING, 5% CANCELLED, 5% EXPIRED
    const statusRand = Math.random();
    let status = 'ACTIVE';
    if (statusRand < 0.05) {
      status = 'PENDING';
    } else if (statusRand < 0.10) {
      status = 'CANCELLED';
    } else if (statusRand < 0.15) {
      status = 'EXPIRED';
    }

    const effectiveDate = new Date();
    effectiveDate.setMonth(effectiveDate.getMonth() - randomInt(0, 12));
    const terminationDate = new Date(effectiveDate);
    terminationDate.setFullYear(terminationDate.getFullYear() + 1);

    const policy = {
      id: generateUUID(),
      policyNumber: generatePolicyNumber(),
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      premium: premium,
      effectiveDate: effectiveDate.toISOString().split('T')[0],
      terminationDate: terminationDate.toISOString().split('T')[0],
      policyValue: policyValue,
      status: status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    policies.push(policy);
    policiesStore.create(policy);

    // Add relationships
    policyDrivers.forEach(driver => {
      policyDriverRelations.addDriverToPolicy(policy.id, driver.id);
    });

    policyVehicles.forEach(vehicle => {
      policyVehicleRelations.addVehicleToPolicy(policy.id, vehicle.id);
    });
  }

  return {
    drivers: drivers.length,
    vehicles: vehicles.length,
    policies: policies.length
  };
}

