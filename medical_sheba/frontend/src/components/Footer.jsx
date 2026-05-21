import { Facebook, MessageCircle, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = '01322458732';
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <footer className="bg-white border-t border-gray-200 mt-12 sm:mt-16 lg:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
          
          {/* Brand Section */}
          <div className="space-y-4 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <img
                src="/logo.png"
                alt="Medi Sheba"
                className="h-10 sm:h-12 w-auto object-contain"
              />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Medi Sheba</h3>
                <p className="text-xs text-gray-500">Healthcare Solutions</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Professional healthcare management platform connecting patients with doctors, hospitals, and medical services across Bangladesh.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 pt-2 justify-center sm:justify-start">
              <a 
                href="https://www.facebook.com/profile.php?id=61589922942262" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-gray-100 hover:bg-blue-600 text-gray-700 hover:text-white rounded-lg transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a 
                href={whatsappLink}
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 hover:bg-green-600 text-gray-700 hover:text-white rounded-lg transition-colors duration-200"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link to="/" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Home</Link></li>
              <li><Link to="/doctors" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Doctors</Link></li>
              <li><Link to="/hospitals" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Hospitals</Link></li>
              <li><Link to="/blood" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Blood Bank</Link></li>
              <li><Link to="/ambulance" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Ambulance</Link></li>
              <li><Link to="/emedicine" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">E-Medicine</Link></li>
              <li><Link to="/edoctor" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">E-Doctor</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link to="/about" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">About Us</Link></li>
              <li><Link to="/privacy" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Terms of Service</Link></li>
              <li><Link to="/contact" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Contact Info</h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex-col sm:flex-row justify-center sm:justify-start">
                <Phone size={18} className="text-blue-600 flex-shrink-0 mt-0 sm:mt-0.5" />
                <div className="text-xs sm:text-sm text-center sm:text-left">
                  <p className="text-gray-500 uppercase text-xs tracking-wide">Phone</p>
                  <p className="text-gray-900 font-semibold">+880 1322458732</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex-col sm:flex-row justify-center sm:justify-start">
                <Mail size={18} className="text-blue-600 flex-shrink-0 mt-0 sm:mt-0.5" />
                <div className="text-xs sm:text-sm text-center sm:text-left">
                  <p className="text-gray-500 uppercase text-xs tracking-wide">Email</p>
                  <a 
                    href="mailto:support.medisheba@gmail.com"
                    className="text-gray-900 font-semibold hover:text-blue-600 transition-colors"
                  >
                    support.medisheba@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8 sm:my-12"></div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-center text-center sm:text-left">
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm text-gray-600">
              &copy; {currentYear} <span className="font-bold text-gray-900">Medi Sheba</span>. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-xs text-gray-600">
            <a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</a>
            <span className="text-gray-300">•</span>
            <a href="/terms" className="hover:text-blue-600 transition-colors">Terms</a>
            <span className="text-gray-300">•</span>
            <a href="/contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
