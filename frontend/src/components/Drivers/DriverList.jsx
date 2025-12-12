import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { driversAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Table, { TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../common/Table';
import styles from './DriverList.module.css';

export default function DriverList() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading } = useApi(() => driversAPI.getAll());

  const drivers = data?.data || [];

  const filteredDrivers = drivers.filter(driver => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        driver.firstName.toLowerCase().includes(searchLower) ||
        driver.lastName.toLowerCase().includes(searchLower) ||
        driver.licenseNumber.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading drivers...</div>;
  }

  return (
    <div className={styles.driverList}>
      <div className={styles.header}>
        <h1>Drivers</h1>
        <Link to="/drivers/new">
          <Button>+ New Driver</Button>
        </Link>
      </div>

      <Card>
        <div className={styles.filters}>
          <Input
            type="text"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>License Number</TableHeaderCell>
              <TableHeaderCell>State</TableHeaderCell>
              <TableHeaderCell>Date of Birth</TableHeaderCell>
              <TableHeaderCell>Points</TableHeaderCell>
              <TableHeaderCell>Accidents</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No drivers found
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <Link to={`/drivers/${driver.id}`} className={styles.link}>
                      {driver.firstName} {driver.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{driver.licenseNumber}</TableCell>
                  <TableCell>{driver.licenseState}</TableCell>
                  <TableCell>{formatDate(driver.dateOfBirth)}</TableCell>
                  <TableCell>{driver.pointsOnLicense}</TableCell>
                  <TableCell>{driver.accidentsCount}</TableCell>
                  <TableCell>
                    <Link to={`/drivers/${driver.id}`}>
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

