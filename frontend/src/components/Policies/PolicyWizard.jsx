import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi, useMutation } from '../../hooks/useApi';
import { policiesAPI, driversAPI, vehiclesAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Input, { Select } from '../common/Input';
import styles from './PolicyWizard.module.css';

const STEPS = ['Policy Information', 'Add Drivers', 'Add Vehicles', 'Review'];

export default function PolicyWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const { data: driversData } = useApi(() => driversAPI.getAll());
  const { data: vehiclesData } = useApi(() => vehiclesAPI.getAll());
  const { mutate: createPolicy, loading: creating } = useMutation((policy) => policiesAPI.create(policy));

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    premium: '',
    effectiveDate: '',
    terminationDate: '',
    policyValue: '',
    status: 'ACTIVE',
    driverIds: [],
    vehicleIds: []
  });

  const [errors, setErrors] = useState({});

  const drivers = driversData?.data || [];
  const vehicles = vehiclesData?.data || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDriverToggle = (driverId) => {
    setFormData(prev => ({
      ...prev,
      driverIds: prev.driverIds.includes(driverId)
        ? prev.driverIds.filter(id => id !== driverId)
        : [...prev.driverIds, driverId]
    }));
  };

  const handleVehicleToggle = (vehicleId) => {
    setFormData(prev => ({
      ...prev,
      vehicleIds: prev.vehicleIds.includes(vehicleId)
        ? prev.vehicleIds.filter(id => id !== vehicleId)
        : [...prev.vehicleIds, vehicleId]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim() || formData.state.length !== 2) newErrors.state = 'State must be 2 letters';
      if (!formData.zipCode.trim() || !/^\d{5}$/.test(formData.zipCode)) newErrors.zipCode = 'ZIP code must be 5 digits';
      if (!formData.premium || parseFloat(formData.premium) <= 0) newErrors.premium = 'Premium must be greater than 0';
      if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective date is required';
      if (!formData.terminationDate) newErrors.terminationDate = 'Termination date is required';
      if (!formData.policyValue || parseFloat(formData.policyValue) <= 0) newErrors.policyValue = 'Policy value must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    try {
      const policyData = {
        address: formData.address,
        city: formData.city,
        state: formData.state.toUpperCase(),
        zipCode: formData.zipCode,
        premium: parseFloat(formData.premium),
        effectiveDate: formData.effectiveDate,
        terminationDate: formData.terminationDate,
        policyValue: parseFloat(formData.policyValue),
        status: formData.status,
        driverIds: formData.driverIds,
        vehicleIds: formData.vehicleIds
      };

      await createPolicy(policyData);
      navigate('/policies');
    } catch (error) {
      alert('Failed to create policy: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.wizard}>
      <h1>Create New Policy</h1>
      
      <div className={styles.steps}>
        {STEPS.map((step, index) => (
          <div
            key={index}
            className={`${styles.step} ${index === currentStep ? styles.active : ''} ${index < currentStep ? styles.completed : ''}`}
          >
            <div className={styles.stepNumber}>{index + 1}</div>
            <div className={styles.stepLabel}>{step}</div>
          </div>
        ))}
      </div>

      <Card>
        {currentStep === 0 && (
          <div>
            <h2>Policy Information</h2>
            <div className={styles.formGrid}>
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
                required
              />
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                required
              />
              <Input
                label="State (2 letters)"
                name="state"
                value={formData.state}
                onChange={handleChange}
                maxLength={2}
                error={errors.state}
                required
                style={{ textTransform: 'uppercase' }}
              />
              <Input
                label="ZIP Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                maxLength={5}
                error={errors.zipCode}
                required
              />
              <Input
                label="Premium (annual)"
                name="premium"
                type="number"
                step="0.01"
                value={formData.premium}
                onChange={handleChange}
                error={errors.premium}
                required
              />
              <Input
                label="Policy Value"
                name="policyValue"
                type="number"
                step="0.01"
                value={formData.policyValue}
                onChange={handleChange}
                error={errors.policyValue}
                required
              />
              <Input
                label="Effective Date"
                name="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={handleChange}
                error={errors.effectiveDate}
                required
              />
              <Input
                label="Termination Date"
                name="terminationDate"
                type="date"
                value={formData.terminationDate}
                onChange={handleChange}
                error={errors.terminationDate}
                required
              />
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired</option>
              </Select>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h2>Add Drivers</h2>
            <p className={styles.helpText}>Select drivers to add to this policy. You can add multiple drivers.</p>
            {drivers.length === 0 ? (
              <div className={styles.empty}>
                No drivers available. <a href="/drivers/new">Create a new driver</a>
              </div>
            ) : (
              <div className={styles.selectionList}>
                {drivers.map((driver) => (
                  <label key={driver.id} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={formData.driverIds.includes(driver.id)}
                      onChange={() => handleDriverToggle(driver.id)}
                    />
                    <div>
                      <div className={styles.itemName}>
                        {driver.firstName} {driver.lastName}
                      </div>
                      <div className={styles.itemMeta}>
                        License: {driver.licenseNumber} ({driver.licenseState}) | Points: {driver.pointsOnLicense} | Accidents: {driver.accidentsCount}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2>Add Vehicles</h2>
            <p className={styles.helpText}>Select vehicles to add to this policy. You can add multiple vehicles.</p>
            {vehicles.length === 0 ? (
              <div className={styles.empty}>
                No vehicles available. <a href="/vehicles/new">Create a new vehicle</a>
              </div>
            ) : (
              <div className={styles.selectionList}>
                {vehicles.map((vehicle) => (
                  <label key={vehicle.id} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={formData.vehicleIds.includes(vehicle.id)}
                      onChange={() => handleVehicleToggle(vehicle.id)}
                    />
                    <div>
                      <div className={styles.itemName}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className={styles.itemMeta}>
                        VIN: {vehicle.vin} | Plate: {vehicle.plateState}-{vehicle.plate}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2>Review & Create</h2>
            <div className={styles.reviewSection}>
              <h3>Policy Information</h3>
              <div className={styles.reviewGrid}>
                <div><strong>Address:</strong> {formData.address}</div>
                <div><strong>City:</strong> {formData.city}, {formData.state} {formData.zipCode}</div>
                <div><strong>Premium:</strong> {formatCurrency(parseFloat(formData.premium) || 0)}/year</div>
                <div><strong>Policy Value:</strong> {formatCurrency(parseFloat(formData.policyValue) || 0)}</div>
                <div><strong>Effective Date:</strong> {formatDate(formData.effectiveDate)}</div>
                <div><strong>Termination Date:</strong> {formatDate(formData.terminationDate)}</div>
                <div><strong>Status:</strong> {formData.status}</div>
              </div>
            </div>
            <div className={styles.reviewSection}>
              <h3>Drivers ({formData.driverIds.length})</h3>
              {formData.driverIds.length === 0 ? (
                <div className={styles.empty}>No drivers selected</div>
              ) : (
                <ul>
                  {formData.driverIds.map(id => {
                    const driver = drivers.find(d => d.id === id);
                    return driver ? <li key={id}>{driver.firstName} {driver.lastName}</li> : null;
                  })}
                </ul>
              )}
            </div>
            <div className={styles.reviewSection}>
              <h3>Vehicles ({formData.vehicleIds.length})</h3>
              {formData.vehicleIds.length === 0 ? (
                <div className={styles.empty}>No vehicles selected</div>
              ) : (
                <ul>
                  {formData.vehicleIds.map(id => {
                    const vehicle = vehicles.find(v => v.id === id);
                    return vehicle ? <li key={id}>{vehicle.year} {vehicle.make} {vehicle.model}</li> : null;
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className={styles.wizardActions}>
          {currentStep > 0 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={creating}>
              Create Policy
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => navigate('/policies')}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}

