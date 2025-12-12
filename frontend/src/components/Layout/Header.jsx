import { Link, useNavigate } from 'react-router-dom';
import { utilitiesAPI } from '../../services/api';
import Button from '../common/Button';
import styles from './Header.module.css';

export default function Header() {
  const navigate = useNavigate();

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all demo data? This will delete all changes and restore the initial seed data.')) {
      try {
        await utilitiesAPI.resetDemo();
        window.location.reload();
      } catch (error) {
        alert('Failed to reset demo data: ' + error.message);
      }
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          🚗 Auto Policy System
        </Link>
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>Dashboard</Link>
          <Link to="/policies" className={styles.navLink}>Policies</Link>
          <Link to="/drivers" className={styles.navLink}>Drivers</Link>
          <Link to="/vehicles" className={styles.navLink}>Vehicles</Link>
        </nav>
        <Button variant="outline" onClick={handleReset}>
          Reset Demo Data
        </Button>
      </div>
    </header>
  );
}

