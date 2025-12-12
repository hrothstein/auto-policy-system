import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import { driversAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import styles from './DriverForm.module.css';

export default function DriverForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const { data, loading } = useApi(() => driversAPI.getById(id), isEdit);
  const { mutate: createDriver, loading: creating } = useMutation((driver) => driversAPI.create(driver));
  const { mutate: updateDriver, loading: updating } = useMutation((driverId, driver) => driversAPI.update(driverId, driver));

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    licenseNumber: '',
    licenseState: '',
    licenseExpiration: '',
    pointsOnLicense: 0,
    accidentsCount: 0
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && data?.data) {
      const driver = data.data;
      setFormData({
        firstName: driver.firstName || '',
        lastName: driver.lastName || '',
        dateOfBirth: driver.dateOfBirth || '',
        licenseNumber: driver.licenseNumber || '',
        licenseState: driver.licenseState || '',
        licenseExpiration: driver.licenseExpiration || '',
        pointsOnLicense: driver.pointsOnLicense || 0,
        accidentsCount: driver.accidentsCount || 0
      });
    }
  }, [isEdit, data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'pointsOnLicense' || name === 'accidentsCount' ? parseInt(value) || 0 : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.licenseState.trim() || formData.licenseState.length !== 2) newErrors.licenseState = 'License state must be 2 letters';
    if (!formData.licenseExpiration) newErrors.licenseExpiration = 'License expiration is required';
    if (formData.pointsOnLicense < 0 || formData.pointsOnLicense > 10) newErrors.pointsOnLicense = 'Points must be between 0 and 10';
    if (formData.accidentsCount < 0 || formData.accidentsCount > 5) newErrors.accidentsCount = 'Accidents must be between 0 and 5';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const driverData = {
        ...formData,
        licenseState: formData.licenseState.toUpperCase()
      };

      if (isEdit) {
        await updateDriver(id, driverData);
      } else {
        await createDriver(driverData);
      }
      navigate('/drivers');
    } catch (error) {
      alert('Failed to save driver: ' + error.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.driverForm}>
      <h1>{isEdit ? 'Edit Driver' : 'Create Driver'}</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
            />
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              error={errors.dateOfBirth}
              required
            />
            <Input
              label="License Number"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              error={errors.licenseNumber}
              required
            />
            <Input
              label="License State (2 letters)"
              name="licenseState"
              value={formData.licenseState}
              onChange={handleChange}
              maxLength={2}
              error={errors.licenseState}
              required
              style={{ textTransform: 'uppercase' }}
            />
            <Input
              label="License Expiration"
              name="licenseExpiration"
              type="date"
              value={formData.licenseExpiration}
              onChange={handleChange}
              error={errors.licenseExpiration}
              required
            />
            <Input
              label="Points on License (0-10)"
              name="pointsOnLicense"
              type="number"
              min="0"
              max="10"
              value={formData.pointsOnLicense}
              onChange={handleChange}
              error={errors.pointsOnLicense}
              required
            />
            <Input
              label="Accidents (last 24 months, 0-5)"
              name="accidentsCount"
              type="number"
              min="0"
              max="5"
              value={formData.accidentsCount}
              onChange={handleChange}
              error={errors.accidentsCount}
              required
            />
          </div>
          <div className={styles.actions}>
            <Button type="submit" disabled={creating || updating}>
              {isEdit ? 'Update Driver' : 'Create Driver'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/drivers')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

