import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './context/authStore';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Doctors from './pages/Doctors';
import DoctorDetail from './pages/DoctorDetail';
import Hospitals from './pages/Hospitals';
import HospitalDetail from './pages/HospitalDetail';
import Blood from './pages/Blood';
import Ambulance from './pages/Ambulance';
import EMedicine from './pages/EMedicine';
import EDoctor from './pages/EDoctor';
import PaymentDemoPage from './pages/PaymentDemoPage';
import ContactSales from './pages/ContactSales';
import Appointments from './pages/Appointments';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';
import PharmacyAdminDashboard from './pages/PharmacyAdminDashboard';
import PharmacyCreatePage from './pages/PharmacyCreatePage';
import HospitalAdminDashboard from './pages/HospitalAdminDashboard';
import HospitalCreatePage from './pages/HospitalCreatePage';

import './styles/App.css';
import './styles/Responsive.css';

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorDetail />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/hospitals/:id" element={<HospitalDetail />} />
            <Route path="/blood" element={<Blood />} />
            <Route path="/ambulance" element={<Ambulance />} />
            <Route path="/emedicine" element={<EMedicine />} />
            <Route path="/payment" element={<PaymentDemoPage />} />
            <Route path="/contact-sales" element={<ContactSales />} />
            <Route path="/pharmacy-admin" element={<PharmacyAdminDashboard />} />
            <Route path="/pharmacy-create" element={<PharmacyCreatePage />} />
            <Route path="/hospital-admin" element={<HospitalAdminDashboard />} />
            <Route path="/hospital-create" element={<HospitalCreatePage />} />
            <Route path="/edoctor" element={<EDoctor />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
