import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './context/authStore';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Hospitals from './pages/Hospitals';
import Blood from './pages/Blood';
import Ambulance from './pages/Ambulance';
import Appointments from './pages/Appointments';
import Login from './pages/Login';
import Register from './pages/Register';

import './styles/App.css';

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
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/blood" element={<Blood />} />
            <Route path="/ambulance" element={<Ambulance />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
