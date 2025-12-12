import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { vehiclesAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Table, { TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../common/Table';
import styles from './VehicleList.module.css';

export default function VehicleList() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading } = useApi(() => vehiclesAPI.getAll());

  const vehicles = data?.data || [];

  const filteredVehicles = vehicles.filter(vehicle => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        vehicle.make.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.vin.toLowerCase().includes(searchLower) ||
        vehicle.plate.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return <div className={styles.loading}>Loading vehicles...</div>;
  }

  return (
    <div className={styles.vehicleList}>
      <div className={styles.header}>
        <h1>Vehicles</h1>
        <Link to="/vehicles/new">
          <Button>+ New Vehicle</Button>
        </Link>
      </div>

      <Card>
        <div className={styles.filters}>
          <Input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Year</TableHeaderCell>
              <TableHeaderCell>Make</TableHeaderCell>
              <TableHeaderCell>Model</TableHeaderCell>
              <TableHeaderCell>VIN</TableHeaderCell>
              <TableHeaderCell>Plate</TableHeaderCell>
              <TableHeaderCell>State</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No vehicles found
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.make}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>
                    <Link to={`/vehicles/${vehicle.id}`} className={styles.link}>
                      {vehicle.vin}
                    </Link>
                  </TableCell>
                  <TableCell>{vehicle.plate}</TableCell>
                  <TableCell>{vehicle.plateState}</TableCell>
                  <TableCell>
                    <Link to={`/vehicles/${vehicle.id}`}>
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

