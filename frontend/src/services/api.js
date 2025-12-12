/**
 * API Client for Auto Policy System
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * Make an API request
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Driver APIs
export const driversAPI = {
  getAll: () => apiRequest('/drivers'),
  getById: (id) => apiRequest(`/drivers/${id}`),
  create: (driver) => apiRequest('/drivers', { method: 'POST', body: driver }),
  update: (id, driver) => apiRequest(`/drivers/${id}`, { method: 'PUT', body: driver }),
  delete: (id) => apiRequest(`/drivers/${id}`, { method: 'DELETE' })
};

// Vehicle APIs
export const vehiclesAPI = {
  getAll: () => apiRequest('/vehicles'),
  getById: (id) => apiRequest(`/vehicles/${id}`),
  create: (vehicle) => apiRequest('/vehicles', { method: 'POST', body: vehicle }),
  update: (id, vehicle) => apiRequest(`/vehicles/${id}`, { method: 'PUT', body: vehicle }),
  delete: (id) => apiRequest(`/vehicles/${id}`, { method: 'DELETE' })
};

// Policy APIs
export const policiesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.driverId) params.append('driverId', filters.driverId);
    if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);
    const query = params.toString();
    return apiRequest(`/policies${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/policies/${id}`),
  create: (policy) => apiRequest('/policies', { method: 'POST', body: policy }),
  update: (id, policy) => apiRequest(`/policies/${id}`, { method: 'PUT', body: policy }),
  delete: (id) => apiRequest(`/policies/${id}`, { method: 'DELETE' }),
  addDriver: (policyId, driverId) => apiRequest(`/policies/${policyId}/drivers`, { method: 'POST', body: { driverId } }),
  removeDriver: (policyId, driverId) => apiRequest(`/policies/${policyId}/drivers/${driverId}`, { method: 'DELETE' }),
  replaceDriver: (policyId, oldDriverId, newDriverId) => apiRequest(`/policies/${policyId}/drivers/${oldDriverId}`, { method: 'PUT', body: { newDriverId } }),
  addVehicle: (policyId, vehicleId) => apiRequest(`/policies/${policyId}/vehicles`, { method: 'POST', body: { vehicleId } }),
  removeVehicle: (policyId, vehicleId) => apiRequest(`/policies/${policyId}/vehicles/${vehicleId}`, { method: 'DELETE' }),
  replaceVehicle: (policyId, oldVehicleId, newVehicleId) => apiRequest(`/policies/${policyId}/vehicles/${oldVehicleId}`, { method: 'PUT', body: { newVehicleId } })
};

// Utility APIs
export const utilitiesAPI = {
  health: () => apiRequest('/health'),
  resetDemo: () => apiRequest('/demo/reset', { method: 'POST' })
};

