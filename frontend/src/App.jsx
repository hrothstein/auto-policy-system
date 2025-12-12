import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import PolicyList from './components/Policies/PolicyList';
import PolicyDetail from './components/Policies/PolicyDetail';
import PolicyForm from './components/Policies/PolicyForm';
import PolicyWizard from './components/Policies/PolicyWizard';
import DriverList from './components/Drivers/DriverList';
import DriverDetail from './components/Drivers/DriverDetail';
import DriverForm from './components/Drivers/DriverForm';
import VehicleList from './components/Vehicles/VehicleList';
import VehicleDetail from './components/Vehicles/VehicleDetail';
import VehicleForm from './components/Vehicles/VehicleForm';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/policies" element={<PolicyList />} />
          <Route path="/policies/new" element={<PolicyWizard />} />
          <Route path="/policies/:id" element={<PolicyDetail />} />
          <Route path="/policies/:id/edit" element={<PolicyForm />} />
          <Route path="/drivers" element={<DriverList />} />
          <Route path="/drivers/new" element={<DriverForm />} />
          <Route path="/drivers/:id" element={<DriverDetail />} />
          <Route path="/drivers/:id/edit" element={<DriverForm />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/vehicles/new" element={<VehicleForm />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

