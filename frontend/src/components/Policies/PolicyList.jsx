import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { policiesAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Input, { Select } from '../common/Input';
import Table, { TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../common/Table';
import styles from './PolicyList.module.css';

export default function PolicyList() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await policiesAPI.getAll({ status: statusFilter || undefined });
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const policies = data?.data || [];

  const filteredPolicies = policies.filter(policy => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        policy.policyNumber.toLowerCase().includes(searchLower) ||
        `${policy.drivers?.[0]?.firstName || ''} ${policy.drivers?.[0]?.lastName || ''}`.toLowerCase().includes(searchLower) ||
        policy.address?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
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

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  if (loading) {
    return <div className={styles.loading}>Loading policies...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.policyList}>
      <div className={styles.header}>
        <h1>Policies</h1>
        <Link to="/policies/new">
          <Button>+ New Policy</Button>
        </Link>
      </div>

      <Card>
        <div className={styles.filters}>
          <Select
            value={statusFilter}
            onChange={handleFilterChange}
            style={{ width: '200px' }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </Select>
          <Input
            type="text"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, maxWidth: '400px' }}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Policy #</TableHeaderCell>
              <TableHeaderCell>Policyholder</TableHeaderCell>
              <TableHeaderCell>Drivers</TableHeaderCell>
              <TableHeaderCell>Vehicles</TableHeaderCell>
              <TableHeaderCell>Premium</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPolicies.length === 0 ? (
              <TableRow>
                <TableCell colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No policies found
                </TableCell>
              </TableRow>
            ) : (
              filteredPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <Link to={`/policies/${policy.id}`} className={styles.link}>
                      {policy.policyNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {policy.drivers && policy.drivers.length > 0
                      ? `${policy.drivers[0].firstName} ${policy.drivers[0].lastName}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{policy.drivers?.length || 0}</TableCell>
                  <TableCell>{policy.vehicles?.length || 0}</TableCell>
                  <TableCell>{formatCurrency(policy.premium)}</TableCell>
                  <TableCell>{getStatusBadge(policy.status)}</TableCell>
                  <TableCell>
                    <Link to={`/policies/${policy.id}`}>
                      <Button variant="outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

