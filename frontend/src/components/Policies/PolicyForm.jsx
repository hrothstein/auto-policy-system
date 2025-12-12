import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import { policiesAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Input, { Select } from '../common/Input';
import styles from './PolicyForm.module.css';

export default function PolicyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const { data, loading } = useApi(() => policiesAPI.getById(id), isEdit);
  const { mutate: createPolicy, loading: creating } = useMutation((policy) => policiesAPI.create(policy));
  const { mutate: updatePolicy, loading: updating } = useMutation((policyId, policy) => policiesAPI.update(policyId, policy));

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    premium: '',
    effectiveDate: '',
    terminationDate: '',
    policyValue: '',
    status: 'ACTIVE'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && data?.data) {
      const policy = data.data;
      setFormData({
        address: policy.address || '',
        city: policy.city || '',
        state: policy.state || '',
        zipCode: policy.zipCode || '',
        premium: policy.premium || '',
        effectiveDate: policy.effectiveDate || '',
        terminationDate: policy.terminationDate || '',
        policyValue: policy.policyValue || '',
        status: policy.status || 'ACTIVE'
      });
    }
  }, [isEdit, data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim() || formData.state.length !== 2) newErrors.state = 'State must be 2 letters';
    if (!formData.zipCode.trim() || !/^\d{5}$/.test(formData.zipCode)) newErrors.zipCode = 'ZIP code must be 5 digits';
    if (!formData.premium || parseFloat(formData.premium) <= 0) newErrors.premium = 'Premium must be greater than 0';
    if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective date is required';
    if (!formData.terminationDate) newErrors.terminationDate = 'Termination date is required';
    if (!formData.policyValue || parseFloat(formData.policyValue) <= 0) newErrors.policyValue = 'Policy value must be greater than 0';
    if (!formData.status) newErrors.status = 'Status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const policyData = {
        ...formData,
        premium: parseFloat(formData.premium),
        policyValue: parseFloat(formData.policyValue),
        state: formData.state.toUpperCase()
      };

      if (isEdit) {
        await updatePolicy(id, policyData);
      } else {
        await createPolicy(policyData);
      }
      navigate('/policies');
    } catch (error) {
      alert('Failed to save policy: ' + error.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.policyForm}>
      <h1>{isEdit ? 'Edit Policy' : 'Create Policy'}</h1>
      <Card>
        <form onSubmit={handleSubmit}>
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
              error={errors.status}
              required
            >
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </Select>
          </div>
          <div className={styles.actions}>
            <Button type="submit" disabled={creating || updating}>
              {isEdit ? 'Update Policy' : 'Create Policy'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/policies')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

