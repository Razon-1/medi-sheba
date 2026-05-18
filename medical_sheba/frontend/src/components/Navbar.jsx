import { Link } from 'react-router-dom';
import { Building2, CalendarDays, ChevronDown, LogOut, Menu, Pill, UserCircle, X } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../context/authStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.email || 'Account';

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    setAccountOpen(false);
    window.location.href = '/';
  };

  const closeMenu = () => {
    setIsOpen(false);
    setAccountOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen((open) => !open);
    setAccountOpen(false);
  };

  const toggleAccountMenu = () => {
    setAccountOpen((open) => !open);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 md:h-20 gap-4">
          
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

          {/* Mobile Actions */}
          <div className="md:hidden ml-auto flex items-center gap-2">
            {user && (
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-primary-700 shadow-sm transition-colors duration-200 hover:bg-primary-50"
                onClick={toggleAccountMenu}
                aria-label="Open account menu"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <UserCircle size={24} />
              </button>
            )}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
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
          </div>

          {/* Center Menu - Desktop */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-1">
            <Link 
              to="/" 
              className="whitespace-nowrap px-2.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/doctors" 
              className="whitespace-nowrap px-2.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Doctors
            </Link>
            <Link 
              to="/hospitals" 
              className="whitespace-nowrap px-2.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Hospitals
            </Link>
            <Link 
              to="/blood" 
              className="whitespace-nowrap px-2.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Blood Bank
            </Link>
            <Link 
              to="/ambulance" 
              className="whitespace-nowrap px-2.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Ambulance
            </Link>
            <Link 
              to="/emedicine" 
              className="whitespace-nowrap px-2.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              E-Medicine
            </Link>
            <Link 
              to="/edoctor" 
              className="whitespace-nowrap px-2.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              E-Doctor
            </Link>
          </div>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex flex-shrink-0 items-center gap-2 lg:gap-3">
            {user ? (
              <div className="relative pl-4 border-l border-gray-200">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-primary-200 hover:bg-primary-50"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                >
                  <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <UserCircle size={22} />
                  </span>
                  <span className="min-w-0">
                    <span className="block max-w-[140px] truncate text-sm font-semibold text-gray-900">{displayName}</span>
                    <span className="block text-xs text-gray-500">Member</span>
                  </span>
                  <ChevronDown size={16} className={`flex-shrink-0 text-gray-500 transition ${accountOpen ? 'rotate-180' : ''}`} />
                </button>

                {accountOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl shadow-slate-900/10"
                    role="menu"
                  >
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
                      <p className="truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/appointments"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-primary-700"
                      >
                        <CalendarDays size={17} />
                        My Care Services
                      </Link>
                      {user?.roles?.includes('pharmacy_admin') && (
                        <Link
                          to="/pharmacy-admin"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                        >
                          <Pill size={17} />
                          My Pharmacy
                        </Link>
                      )}
                      {user?.roles?.includes('hospital_admin') && (
                        <Link
                          to="/hospital-admin"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Building2 size={17} />
                          My Hospital
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut size={17} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
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

        {/* Mobile Account Menu */}
        {accountOpen && user && (
          <div
            className="md:hidden fixed left-4 right-4 top-[72px] z-[60] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-slate-900/20"
            role="menu"
          >
            <div className="border-b border-gray-100 px-5 py-4">
              <p className="truncate text-base font-semibold text-gray-900">{displayName}</p>
              <p className="truncate text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="p-3">
              <Link
                to="/appointments"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-50 hover:text-primary-700"
              >
                <CalendarDays size={20} />
                My Care Services
              </Link>
              {user?.roles?.includes('pharmacy_admin') && (
                <Link
                  to="/pharmacy-admin"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                >
                  <Pill size={20} />
                  My Pharmacy
                </Link>
              )}
              {user?.roles?.includes('hospital_admin') && (
                <Link
                  to="/hospital-admin"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <Building2 size={20} />
                  My Hospital
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        )}

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
                  My Care Services
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

