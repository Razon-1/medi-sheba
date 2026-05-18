import { Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../context/authStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    window.location.href = '/';
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
          
          {/* Logo Section - Left */}
          <Link 
            to="/" 
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
            onClick={closeMenu}
          >
            <img
              src="/logo.png"
              alt="Medi Sheba"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <span className="hidden sm:inline text-base sm:text-lg md:text-xl font-bold text-gray-900">
              Medi Sheba
            </span>
          </Link>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X size={24} className="text-gray-900" />
            ) : (
              <Menu size={24} className="text-gray-900" />
            )}
          </button>

          {/* Center Menu - Desktop */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link 
              to="/" 
              className="px-3 py-2 rounded-lg text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/doctors" 
              className="px-3 py-2 rounded-lg text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Doctors
            </Link>
            <Link 
              to="/hospitals" 
              className="px-3 py-2 rounded-lg text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Hospitals
            </Link>
            <Link 
              to="/blood" 
              className="px-3 py-2 rounded-lg text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Blood Bank
            </Link>
            <Link 
              to="/ambulance" 
              className="px-3 py-2 rounded-lg text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Ambulance
            </Link>
            <Link 
              to="/emedicine" 
              className="px-3 py-2 rounded-lg text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              E-Medicine
            </Link>
            <Link 
              to="/edoctor" 
              className="px-3 py-2 rounded-lg text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              E-Doctor
            </Link>
            
            {user && (
              <Link
                to="/appointments"
                className="px-3 py-2 rounded-lg text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                My Appointments
              </Link>
            )}

            {user?.roles?.includes('pharmacy_admin') && (
              <Link
                to="/pharmacy-admin"
                className="px-3 py-2 rounded-lg text-sm lg:text-base font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors duration-200"
              >
                My Pharmacy
              </Link>
            )}

            {user?.roles?.includes('hospital_admin') && (
              <Link
                to="/hospital-admin"
                className="px-3 py-2 rounded-lg text-sm lg:text-base font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200"
              >
                My Hospital
              </Link>
            )}
          </div>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 ml-4">
            {user ? (
              <div className="flex items-center gap-2 lg:gap-3 pl-4 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs lg:text-sm font-semibold text-gray-900">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : user.email}
                  </p>
                  <p className="text-xs text-gray-500">Member</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 flex items-center gap-2 font-medium text-sm"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 lg:gap-3">
                <Link 
                  to="/login" 
                  className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-semibold text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2 max-h-96 overflow-y-auto">
              <Link
                to="/"
                onClick={closeMenu}
                className="block w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium text-sm"
              >
                Home
              </Link>
              <Link
                to="/doctors"
                onClick={closeMenu}
                className="block w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium text-sm"
              >
                Doctors
              </Link>
              <Link
                to="/hospitals"
                onClick={closeMenu}
                className="block w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium text-sm"
              >
                Hospitals
              </Link>
              <Link
                to="/blood"
                onClick={closeMenu}
                className="block w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium text-sm"
              >
                Blood Bank
              </Link>
              <Link
                to="/ambulance"
                onClick={closeMenu}
                className="block w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium text-sm"
              >
                Ambulance
              </Link>
              <Link
                to="/emedicine"
                onClick={closeMenu}
                className="block w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium text-sm"
              >
                E-Medicine
              </Link>
              <Link
                to="/edoctor"
                onClick={closeMenu}
                className="block w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium text-sm"
              >
                E-Doctor
              </Link>

              {user && (
                <Link
                  to="/appointments"
                  onClick={closeMenu}
                  className="block w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium text-sm"
                >
                  My Appointments
                </Link>
              )}

              {user?.roles?.includes('pharmacy_admin') && (
                <Link
                  to="/pharmacy-admin"
                  onClick={closeMenu}
                  className="block w-full px-4 py-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors duration-200 font-medium text-sm"
                >
                  My Pharmacy
                </Link>
              )}

              {user?.roles?.includes('hospital_admin') && (
                <Link
                  to="/hospital-admin"
                  onClick={closeMenu}
                  className="block w-full px-4 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200 font-medium text-sm"
                >
                  My Hospital
                </Link>
              )}

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {user ? (
                  <>
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.email}
                      </p>
                      <p className="text-xs text-gray-500">Member</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 font-semibold text-sm"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      onClick={closeMenu}
                      className="w-full block px-4 py-3 rounded-lg text-center text-blue-600 border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200 font-semibold text-sm"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={closeMenu}
                      className="w-full block px-4 py-3 rounded-lg text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold text-sm"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

