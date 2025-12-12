import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi, useMutation } from '../../hooks/useApi';
import { vehiclesAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import styles from './VehicleDetail.module.css';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data, loading } = useApi(() => vehiclesAPI.getById(id));
  const { mutate: deleteVehicle, loading: deleting } = useMutation((vehicleId) => vehiclesAPI.delete(vehicleId));

  const vehicle = data?.data;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteVehicle(id);
      navigate('/vehicles');
    } catch (error) {
      alert('Failed to delete vehicle: ' + error.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading vehicle...</div>;
  }

  if (!vehicle) {
    return <div className={styles.error}>Vehicle not found</div>;
  }

  return (
    <div className={styles.vehicleDetail}>
      <div className={styles.header}>
        <Link to="/vehicles" className={styles.backLink}>← Back to Vehicles</Link>
        <div className={styles.headerActions}>
          <Link to={`/vehicles/${id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            Delete
          </Button>
        </div>
      </div>

      <h1>{vehicle.year} {vehicle.make} {vehicle.model}</h1>

      <div className={styles.grid}>
        <Card>
          <h2>Vehicle Information</h2>
          <div className={styles.detailGrid}>
            <div>
              <div className={styles.label}>Year</div>
              <div className={styles.value}>{vehicle.year}</div>
            </div>
            <div>
              <div className={styles.label}>Make</div>
              <div className={styles.value}>{vehicle.make}</div>
            </div>
            <div>
              <div className={styles.label}>Model</div>
              <div className={styles.value}>{vehicle.model}</div>
            </div>
          </div>
        </Card>

        <Card>
          <h2>Registration Information</h2>
          <div className={styles.detailGrid}>
            <div>
              <div className={styles.label}>VIN</div>
              <div className={styles.value}>{vehicle.vin}</div>
            </div>
            <div>
              <div className={styles.label}>License Plate</div>
              <div className={styles.value}>{vehicle.plate}</div>
            </div>
            <div>
              <div className={styles.label}>Plate State</div>
              <div className={styles.value}>{vehicle.plateState}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

