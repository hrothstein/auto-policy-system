import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi, useMutation } from '../../hooks/useApi';
import { policiesAPI, driversAPI, vehiclesAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input, { Select } from '../common/Input';
import { useState } from 'react';
import styles from './PolicyDetail.module.css';

export default function PolicyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  
  const { data, loading, execute } = useApi(() => policiesAPI.getById(id));
  const { data: driversData } = useApi(() => driversAPI.getAll());
  const { data: vehiclesData } = useApi(() => vehiclesAPI.getAll());
  
  const { mutate: addDriver, loading: addingDriver } = useMutation((policyId, driverId) => 
    policiesAPI.addDriver(policyId, driverId)
  );
  const { mutate: removeDriver, loading: removingDriver } = useMutation((policyId, driverId) => 
    policiesAPI.removeDriver(policyId, driverId)
  );
  const { mutate: addVehicle, loading: addingVehicle } = useMutation((policyId, vehicleId) => 
    policiesAPI.addVehicle(policyId, vehicleId)
  );
  const { mutate: removeVehicle, loading: removingVehicle } = useMutation((policyId, vehicleId) => 
    policiesAPI.removeVehicle(policyId, vehicleId)
  );
  const { mutate: deletePolicy, loading: deleting } = useMutation((policyId) => 
    policiesAPI.delete(policyId)
  );

  const policy = data?.data;

  // Get available drivers and vehicles (not already on this policy)
  const allDrivers = driversData?.data || [];
  const allVehicles = vehiclesData?.data || [];
  const availableDrivers = allDrivers.filter(d => 
    !policy?.drivers?.some(pd => pd.id === d.id)
  );
  const availableVehicles = allVehicles.filter(v => 
    !policy?.vehicles?.some(pv => pv.id === v.id)
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      ACTIVE: styles.statusActive,
      PENDING: styles.statusPending,
      CANCELLED: styles.statusCancelled,
      EXPIRED: styles.statusExpired
    };
    return <span className={`${styles.statusBadge} ${statusStyles[status] || ''}`}>{status}</span>;
  };

  const handleAddDriver = async () => {
    if (!selectedDriverId) return;
    try {
      await addDriver(id, selectedDriverId);
      setShowAddDriverModal(false);
      setSelectedDriverId('');
      execute();
    } catch (error) {
      alert('Failed to add driver: ' + error.message);
    }
  };

  const handleRemoveDriver = async (driverId) => {
    if (!window.confirm('Remove this driver from the policy?')) return;
    try {
      await removeDriver(id, driverId);
      execute();
    } catch (error) {
      alert('Failed to remove driver: ' + error.message);
    }
  };

  const handleAddVehicle = async () => {
    if (!selectedVehicleId) return;
    try {
      await addVehicle(id, selectedVehicleId);
      setShowAddVehicleModal(false);
      setSelectedVehicleId('');
      execute();
    } catch (error) {
      alert('Failed to add vehicle: ' + error.message);
    }
  };

  const handleRemoveVehicle = async (vehicleId) => {
    if (!window.confirm('Remove this vehicle from the policy?')) return;
    try {
      await removeVehicle(id, vehicleId);
      execute();
    } catch (error) {
      alert('Failed to remove vehicle: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    try {
      await deletePolicy(id);
      navigate('/policies');
    } catch (error) {
      alert('Failed to delete policy: ' + error.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading policy...</div>;
  }

  if (!policy) {
    return <div className={styles.error}>Policy not found</div>;
  }

  return (
    <div className={styles.policyDetail}>
      <div className={styles.header}>
        <Link to="/policies" className={styles.backLink}>← Back to Policies</Link>
        <div className={styles.headerActions}>
          <Link to={`/policies/${id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            Delete
          </Button>
        </div>
      </div>

      <div className={styles.titleSection}>
        <h1>Policy {policy.policyNumber}</h1>
        <div>Status: {getStatusBadge(policy.status)}</div>
      </div>

      <div className={styles.grid}>
        <Card>
          <h2>Policy Details</h2>
          <div className={styles.detailGrid}>
            <div>
              <div className={styles.label}>Address</div>
              <div className={styles.value}>{policy.address}</div>
            </div>
            <div>
              <div className={styles.label}>City</div>
              <div className={styles.value}>{policy.city}, {policy.state} {policy.zipCode}</div>
            </div>
            <div>
              <div className={styles.label}>Effective Date</div>
              <div className={styles.value}>{formatDate(policy.effectiveDate)}</div>
            </div>
            <div>
              <div className={styles.label}>Termination Date</div>
              <div className={styles.value}>{formatDate(policy.terminationDate)}</div>
            </div>
          </div>
        </Card>

        <Card>
          <h2>Coverage</h2>
          <div className={styles.detailGrid}>
            <div>
              <div className={styles.label}>Premium</div>
              <div className={styles.value}>{formatCurrency(policy.premium)}/year</div>
            </div>
            <div>
              <div className={styles.label}>Policy Value</div>
              <div className={styles.value}>{formatCurrency(policy.policyValue)}</div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className={styles.sectionHeader}>
          <h2>Drivers ({policy.drivers?.length || 0})</h2>
          <Button onClick={() => setShowAddDriverModal(true)}>+ Add Driver</Button>
        </div>
        {policy.drivers && policy.drivers.length > 0 ? (
          <div className={styles.list}>
            {policy.drivers.map((driver) => (
              <div key={driver.id} className={styles.listItem}>
                <div className={styles.listItemContent}>
                  <div>
                    <Link to={`/drivers/${driver.id}`} className={styles.link}>
                      👤 {driver.firstName} {driver.lastName}
                    </Link>
                  </div>
                  <div className={styles.listItemMeta}>
                    DOB: {formatDate(driver.dateOfBirth)} | Points: {driver.pointsOnLicense} | Accidents: {driver.accidentsCount}
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={() => handleRemoveDriver(driver.id)}
                  disabled={removingDriver}
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>No drivers added</div>
        )}
      </Card>

      <Card>
        <div className={styles.sectionHeader}>
          <h2>Vehicles ({policy.vehicles?.length || 0})</h2>
          <Button onClick={() => setShowAddVehicleModal(true)}>+ Add Vehicle</Button>
        </div>
        {policy.vehicles && policy.vehicles.length > 0 ? (
          <div className={styles.list}>
            {policy.vehicles.map((vehicle) => (
              <div key={vehicle.id} className={styles.listItem}>
                <div className={styles.listItemContent}>
                  <div>
                    <Link to={`/vehicles/${vehicle.id}`} className={styles.link}>
                      🚗 {vehicle.year} {vehicle.make} {vehicle.model}
                    </Link>
                  </div>
                  <div className={styles.listItemMeta}>
                    VIN: {vehicle.vin} | Plate: {vehicle.plateState}-{vehicle.plate}
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={() => handleRemoveVehicle(vehicle.id)}
                  disabled={removingVehicle}
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>No vehicles added</div>
        )}
      </Card>

      <Modal
        isOpen={showAddDriverModal}
        onClose={() => {
          setShowAddDriverModal(false);
          setSelectedDriverId('');
        }}
        title="Add Driver to Policy"
      >
        <Select
          label="Select Driver"
          value={selectedDriverId}
          onChange={(e) => setSelectedDriverId(e.target.value)}
        >
          <option value="">Select a driver...</option>
          {availableDrivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.firstName} {driver.lastName} - {driver.licenseNumber}
            </option>
          ))}
        </Select>
        {availableDrivers.length === 0 && (
          <div style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            No available drivers. <Link to="/drivers/new">Create a new driver</Link>
          </div>
        )}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <Button onClick={handleAddDriver} disabled={!selectedDriverId || addingDriver}>
            Add Driver
          </Button>
          <Button variant="outline" onClick={() => setShowAddDriverModal(false)}>
            Cancel
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showAddVehicleModal}
        onClose={() => {
          setShowAddVehicleModal(false);
          setSelectedVehicleId('');
        }}
        title="Add Vehicle to Policy"
      >
        <Select
          label="Select Vehicle"
          value={selectedVehicleId}
          onChange={(e) => setSelectedVehicleId(e.target.value)}
        >
          <option value="">Select a vehicle...</option>
          {availableVehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.plate}
            </option>
          ))}
        </Select>
        {availableVehicles.length === 0 && (
          <div style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            No available vehicles. <Link to="/vehicles/new">Create a new vehicle</Link>
          </div>
        )}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <Button onClick={handleAddVehicle} disabled={!selectedVehicleId || addingVehicle}>
            Add Vehicle
          </Button>
          <Button variant="outline" onClick={() => setShowAddVehicleModal(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

