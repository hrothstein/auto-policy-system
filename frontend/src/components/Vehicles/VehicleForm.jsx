import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import { vehiclesAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import styles from './VehicleForm.module.css';

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const { data, loading } = useApi(() => vehiclesAPI.getById(id), isEdit);
  const { mutate: createVehicle, loading: creating } = useMutation((vehicle) => vehiclesAPI.create(vehicle));
  const { mutate: updateVehicle, loading: updating } = useMutation((vehicleId, vehicle) => vehiclesAPI.update(vehicleId, vehicle));

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    make: '',
    model: '',
    vin: '',
    plate: '',
    plateState: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && data?.data) {
      const vehicle = data.data;
      setFormData({
        year: vehicle.year || new Date().getFullYear(),
        make: vehicle.make || '',
        model: vehicle.model || '',
        vin: vehicle.vin || '',
        plate: vehicle.plate || '',
        plateState: vehicle.plateState || ''
      });
    }
  }, [isEdit, data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'year' ? parseInt(value) || new Date().getFullYear() : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.year || formData.year < 1990 || formData.year > 2025) newErrors.year = 'Year must be between 1990 and 2025';
    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.vin.trim() || formData.vin.length !== 17) newErrors.vin = 'VIN must be 17 characters';
    if (!formData.plate.trim()) newErrors.plate = 'License plate is required';
    if (!formData.plateState.trim() || formData.plateState.length !== 2) newErrors.plateState = 'Plate state must be 2 letters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const vehicleData = {
        ...formData,
        plateState: formData.plateState.toUpperCase(),
        vin: formData.vin.toUpperCase()
      };

      if (isEdit) {
        await updateVehicle(id, vehicleData);
      } else {
        await createVehicle(vehicleData);
      }
      navigate('/vehicles');
    } catch (error) {
      alert('Failed to save vehicle: ' + error.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.vehicleForm}>
      <h1>{isEdit ? 'Edit Vehicle' : 'Create Vehicle'}</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <Input
              label="Year"
              name="year"
              type="number"
              min="1990"
              max="2025"
              value={formData.year}
              onChange={handleChange}
              error={errors.year}
              required
            />
            <Input
              label="Make"
              name="make"
              value={formData.make}
              onChange={handleChange}
              error={errors.make}
              required
            />
            <Input
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              error={errors.model}
              required
            />
            <Input
              label="VIN (17 characters)"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              maxLength={17}
              error={errors.vin}
              required
              style={{ textTransform: 'uppercase' }}
            />
            <Input
              label="License Plate"
              name="plate"
              value={formData.plate}
              onChange={handleChange}
              error={errors.plate}
              required
            />
            <Input
              label="Plate State (2 letters)"
              name="plateState"
              value={formData.plateState}
              onChange={handleChange}
              maxLength={2}
              error={errors.plateState}
              required
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <div className={styles.actions}>
            <Button type="submit" disabled={creating || updating}>
              {isEdit ? 'Update Vehicle' : 'Create Vehicle'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/vehicles')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

