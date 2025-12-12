import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { policiesAPI, driversAPI, vehiclesAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Table, { TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../common/Table';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [policiesData, setPoliciesData] = useState(null);
  const [driversData, setDriversData] = useState(null);
  const [vehiclesData, setVehiclesData] = useState(null);
  const [policiesLoading, setPoliciesLoading] = useState(true);
  const [driversLoading, setDriversLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policies, drivers, vehicles] = await Promise.all([
          policiesAPI.getAll(),
          driversAPI.getAll(),
          vehiclesAPI.getAll()
        ]);
        setPoliciesData(policies);
        setDriversData(drivers);
        setVehiclesData(vehicles);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setPoliciesLoading(false);
        setDriversLoading(false);
        setVehiclesLoading(false);
      }
    };
    fetchData();
  }, []);

  const policies = policiesData?.data || [];
  const drivers = driversData?.data || [];
  const vehicles = vehiclesData?.data || [];

  // Get recent policies (last 10)
  const recentPolicies = policies
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

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

  if (policiesLoading || driversLoading || vehiclesLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{policies.length}</div>
          <div className={styles.statLabel}>Policies</div>
          <div className={styles.statSubtext}>Active</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{drivers.length}</div>
          <div className={styles.statLabel}>Drivers</div>
          <div className={styles.statSubtext}>Licensed</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{vehicles.length}</div>
          <div className={styles.statLabel}>Vehicles</div>
          <div className={styles.statSubtext}>Registered</div>
        </Card>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Policies</h2>
          <Link to="/policies">
            <Button variant="outline">View All Policies</Button>
          </Link>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Policy #</TableHeaderCell>
                <TableHeaderCell>Policyholder</TableHeaderCell>
                <TableHeaderCell>Drivers</TableHeaderCell>
                <TableHeaderCell>Vehicles</TableHeaderCell>
                <TableHeaderCell>Premium</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPolicies.map((policy) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className={styles.actions}>
        <Link to="/policies/new">
          <Button>Create New Policy</Button>
        </Link>
        <Link to="/drivers">
          <Button variant="outline">View All Drivers</Button>
        </Link>
        <Link to="/vehicles">
          <Button variant="outline">View All Vehicles</Button>
        </Link>
      </div>
    </div>
  );
}

