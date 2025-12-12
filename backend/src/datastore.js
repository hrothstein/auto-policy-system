/**
 * In-Memory Datastore for Auto Policy System
 * Uses Maps for O(1) lookups and maintains relationships via junction Maps
 */

// Main entity stores
const drivers = new Map();
const vehicles = new Map();
const policies = new Map();

// Junction tables for many-to-many relationships
// Key format: "policyId:driverId" or "policyId:vehicleId"
const policyDrivers = new Map(); // Stores policyId -> Set of driverIds
const policyVehicles = new Map(); // Stores policyId -> Set of vehicleIds
const driverPolicies = new Map(); // Stores driverId -> Set of policyIds (reverse index)
const vehiclePolicies = new Map(); // Stores vehicleId -> Set of policyIds (reverse index)

/**
 * Driver CRUD Operations
 */
export const driverStore = {
  getAll() {
    return Array.from(drivers.values());
  },

  getById(id) {
    return drivers.get(id) || null;
  },

  create(driver) {
    drivers.set(driver.id, driver);
    driverPolicies.set(driver.id, new Set());
    return driver;
  },

  update(id, updates) {
    const driver = drivers.get(id);
    if (!driver) {
      return null;
    }
    const updated = { ...driver, ...updates, updatedAt: new Date().toISOString() };
    drivers.set(id, updated);
    return updated;
  },

  delete(id) {
    // Check if driver is on any active policies
    const policies = driverPolicies.get(id);
    if (policies && policies.size > 0) {
      const activePolicies = Array.from(policies).filter(pid => {
        const policy = policiesStore.getById(pid);
        return policy && policy.status === 'ACTIVE';
      });
      if (activePolicies.length > 0) {
        throw new Error('Cannot delete driver associated with active policies');
      }
    }
    drivers.delete(id);
    driverPolicies.delete(id);
    return true;
  },

  exists(id) {
    return drivers.has(id);
  }
};

/**
 * Vehicle CRUD Operations
 */
export const vehicleStore = {
  getAll() {
    return Array.from(vehicles.values());
  },

  getById(id) {
    return vehicles.get(id) || null;
  },

  create(vehicle) {
    vehicles.set(vehicle.id, vehicle);
    vehiclePolicies.set(vehicle.id, new Set());
    return vehicle;
  },

  update(id, updates) {
    const vehicle = vehicles.get(id);
    if (!vehicle) {
      return null;
    }
    const updated = { ...vehicle, ...updates, updatedAt: new Date().toISOString() };
    vehicles.set(id, updated);
    return updated;
  },

  delete(id) {
    // Check if vehicle is on any active policies
    const policies = vehiclePolicies.get(id);
    if (policies && policies.size > 0) {
      const activePolicies = Array.from(policies).filter(pid => {
        const policy = policiesStore.getById(pid);
        return policy && policy.status === 'ACTIVE';
      });
      if (activePolicies.length > 0) {
        throw new Error('Cannot delete vehicle associated with active policies');
      }
    }
    vehicles.delete(id);
    vehiclePolicies.delete(id);
    return true;
  },

  exists(id) {
    return vehicles.has(id);
  }
};

/**
 * Policy CRUD Operations
 */
export const policiesStore = {
  getAll() {
    return Array.from(policies.values());
  },

  getById(id) {
    return policies.get(id) || null;
  },

  create(policy) {
    policies.set(policy.id, policy);
    policyDrivers.set(policy.id, new Set());
    policyVehicles.set(policy.id, new Set());
    return policy;
  },

  update(id, updates) {
    const policy = policies.get(id);
    if (!policy) {
      return null;
    }
    const updated = { ...policy, ...updates, updatedAt: new Date().toISOString() };
    policies.set(id, updated);
    return updated;
  },

  delete(id) {
    const policy = policies.get(id);
    if (!policy) {
      return null;
    }

    // Remove relationships
    const driverIds = policyDrivers.get(id);
    if (driverIds) {
      driverIds.forEach(driverId => {
        const driverPols = driverPolicies.get(driverId);
        if (driverPols) {
          driverPols.delete(id);
        }
      });
    }

    const vehicleIds = policyVehicles.get(id);
    if (vehicleIds) {
      vehicleIds.forEach(vehicleId => {
        const vehPols = vehiclePolicies.get(vehicleId);
        if (vehPols) {
          vehPols.delete(id);
        }
      });
    }

    policies.delete(id);
    policyDrivers.delete(id);
    policyVehicles.delete(id);
    return true;
  },

  exists(id) {
    return policies.has(id);
  }
};

/**
 * Policy-Driver Relationship Management
 */
export const policyDriverRelations = {
  addDriverToPolicy(policyId, driverId) {
    if (!policiesStore.exists(policyId)) {
      throw new Error('Policy not found');
    }
    if (!driverStore.exists(driverId)) {
      throw new Error('Driver not found');
    }

    const drivers = policyDrivers.get(policyId) || new Set();
    drivers.add(driverId);
    policyDrivers.set(policyId, drivers);

    const policies = driverPolicies.get(driverId) || new Set();
    policies.add(policyId);
    driverPolicies.set(driverId, policies);

    return true;
  },

  removeDriverFromPolicy(policyId, driverId) {
    const drivers = policyDrivers.get(policyId);
    if (drivers) {
      drivers.delete(driverId);
    }

    const policies = driverPolicies.get(driverId);
    if (policies) {
      policies.delete(policyId);
    }

    return true;
  },

  replaceDriverOnPolicy(policyId, oldDriverId, newDriverId) {
    this.removeDriverFromPolicy(policyId, oldDriverId);
    this.addDriverToPolicy(policyId, newDriverId);
    return true;
  },

  getDriversForPolicy(policyId) {
    const driverIds = policyDrivers.get(policyId);
    if (!driverIds) {
      return [];
    }
    return Array.from(driverIds).map(id => driverStore.getById(id)).filter(Boolean);
  },

  getPoliciesForDriver(driverId) {
    const policyIds = driverPolicies.get(driverId);
    if (!policyIds) {
      return [];
    }
    return Array.from(policyIds).map(id => policiesStore.getById(id)).filter(Boolean);
  }
};

/**
 * Policy-Vehicle Relationship Management
 */
export const policyVehicleRelations = {
  addVehicleToPolicy(policyId, vehicleId) {
    if (!policiesStore.exists(policyId)) {
      throw new Error('Policy not found');
    }
    if (!vehicleStore.exists(vehicleId)) {
      throw new Error('Vehicle not found');
    }

    const vehicles = policyVehicles.get(policyId) || new Set();
    vehicles.add(vehicleId);
    policyVehicles.set(policyId, vehicles);

    const policies = vehiclePolicies.get(vehicleId) || new Set();
    policies.add(policyId);
    vehiclePolicies.set(vehicleId, policies);

    return true;
  },

  removeVehicleFromPolicy(policyId, vehicleId) {
    const vehicles = policyVehicles.get(policyId);
    if (vehicles) {
      vehicles.delete(vehicleId);
    }

    const policies = vehiclePolicies.get(vehicleId);
    if (policies) {
      policies.delete(policyId);
    }

    return true;
  },

  replaceVehicleOnPolicy(policyId, oldVehicleId, newVehicleId) {
    this.removeVehicleFromPolicy(policyId, oldVehicleId);
    this.addVehicleToPolicy(policyId, newVehicleId);
    return true;
  },

  getVehiclesForPolicy(policyId) {
    const vehicleIds = policyVehicles.get(policyId);
    if (!vehicleIds) {
      return [];
    }
    return Array.from(vehicleIds).map(id => vehicleStore.getById(id)).filter(Boolean);
  },

  getPoliciesForVehicle(vehicleId) {
    const policyIds = vehiclePolicies.get(vehicleId);
    if (!policyIds) {
      return [];
    }
    return Array.from(policyIds).map(id => policiesStore.getById(id)).filter(Boolean);
  }
};

/**
 * Reset all data (for demo reset functionality)
 */
export function resetDataStore() {
  drivers.clear();
  vehicles.clear();
  policies.clear();
  policyDrivers.clear();
  policyVehicles.clear();
  driverPolicies.clear();
  vehiclePolicies.clear();
}

/**
 * Get statistics for dashboard
 */
export function getStatistics() {
  return {
    drivers: drivers.size,
    vehicles: vehicles.size,
    policies: policies.size
  };
}

