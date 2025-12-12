import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi, useMutation } from '../../hooks/useApi';
import { driversAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import styles from './DriverDetail.module.css';

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data, loading } = useApi(() => driversAPI.getById(id));
  const { mutate: deleteDriver, loading: deleting } = useMutation((driverId) => driversAPI.delete(driverId));

  const driver = data?.data;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      await deleteDriver(id);
      navigate('/drivers');
    } catch (error) {
      alert('Failed to delete driver: ' + error.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading driver...</div>;
  }

  if (!driver) {
    return <div className={styles.error}>Driver not found</div>;
  }

  return (
    <div className={styles.driverDetail}>
      <div className={styles.header}>
        <Link to="/drivers" className={styles.backLink}>← Back to Drivers</Link>
        <div className={styles.headerActions}>
          <Link to={`/drivers/${id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            Delete
          </Button>
        </div>
      </div>

      <h1>{driver.firstName} {driver.lastName}</h1>

      <div className={styles.grid}>
        <Card>
          <h2>Personal Information</h2>
          <div className={styles.detailGrid}>
            <div>
              <div className={styles.label}>First Name</div>
              <div className={styles.value}>{driver.firstName}</div>
            </div>
            <div>
              <div className={styles.label}>Last Name</div>
              <div className={styles.value}>{driver.lastName}</div>
            </div>
            <div>
              <div className={styles.label}>Date of Birth</div>
              <div className={styles.value}>{formatDate(driver.dateOfBirth)}</div>
            </div>
          </div>
        </Card>

        <Card>
          <h2>License Information</h2>
          <div className={styles.detailGrid}>
            <div>
              <div className={styles.label}>License Number</div>
              <div className={styles.value}>{driver.licenseNumber}</div>
            </div>
            <div>
              <div className={styles.label}>License State</div>
              <div className={styles.value}>{driver.licenseState}</div>
            </div>
            <div>
              <div className={styles.label}>Expiration Date</div>
              <div className={styles.value}>{formatDate(driver.licenseExpiration)}</div>
            </div>
          </div>
        </Card>

        <Card>
          <h2>Driving Record</h2>
          <div className={styles.detailGrid}>
            <div>
              <div className={styles.label}>Points on License</div>
              <div className={styles.value}>{driver.pointsOnLicense}</div>
            </div>
            <div>
              <div className={styles.label}>Accidents (last 24 months)</div>
              <div className={styles.value}>{driver.accidentsCount}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

