import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin, MapPin } from 'lucide-react';

interface WebsiteLayoutProps {
  children: React.ReactNode;
}

export const WebsiteLayout: React.FC<WebsiteLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Departments', href: '/departments' },
    { name: 'Services', href: '/services' },
    { name: 'Doctors', href: '/doctors' },
    { name: 'Appointments', href: '/appointments' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <img 
                  src="/logo.png" 
                  alt="Hospital Logo" 
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Aditya Hospital</h1>
                  <p className="text-sm text-gray-600">Multispeciality Hospital</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Emergency Contact Info - Desktop */}
            <div className="hidden lg:flex flex-col items-end justify-center pt-0">
              <div className="flex items-center space-x-4 mb-1">
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">+91 8638559875</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">info@adityahospitalnagaon.com</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-amber-600 font-semibold">24/7 EMERGENCY SERVICES</span>
              </div>
              <div className="hidden lg:flex items-center space-x-4 py-2">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to="/appointments">Book Appointment</Link>
              </Button>
              </div>
            </div>

            {/* CTA Button */}
            

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {/* Emergency Contact Info - Mobile */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Emergency Contact</h4>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5" />
                      <span className="text-base">+91 8638559875 / +91 8099983875</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5" />
                      <span className="text-base">info@adityahospitalnagaon.com</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5" />
                      <span className="text-base">24/7 Emergency Services</span>
                    </div>
                  </div>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 w-full mt-4">
                  <Link to="/appointments" onClick={() => setMobileMenuOpen(false)}>
                    Book Appointment
                  </Link>
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Hospital Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Hospital Logo" 
                className="h-10 w-10 object-contain"
              />
                <div>
                  <h3 className="text-xl font-bold">Aditya Hospital</h3>
                  <p className="text-sm text-gray-400">Multispeciality Hospital</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Providing world-class healthcare services with compassion and cutting-edge technology.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/adityahospitalnagaon/" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/adityahospitalnagaon/" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Quick Links</h4>
              <ul className="space-y-2">
                {navigation.slice(1).map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Our Services</h4>
              <ul className="space-y-2">
                <li><a className="text-gray-400 hover:text-white transition-colors text-sm">HI-TECH ICU,PICU,NICU</a></li>
                <li><a className="text-gray-400 hover:text-white transition-colors text-sm">MODULAR OT</a></li>
                <li><a className="text-gray-400 hover:text-white transition-colors text-sm">General Medicine</a></li>
                <li><a className="text-gray-400 hover:text-white transition-colors text-sm">General Surgery</a></li>
                <li><a className="text-gray-400 hover:text-white transition-colors text-sm">Ophthalmology</a></li>
                <li><a className="text-gray-400 hover:text-white transition-colors text-sm">Dental Unit</a></li>
                <li><a className="text-gray-400 hover:text-white transition-colors text-sm">Laboratory</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Medical College Road, Diphalu, Nagaon - 782003</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">+91 8638559875 / +91 8099983875</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">info@adityahospitalnagaon.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">24/7 Emergency Services</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 mt-5 pt-3 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Aditya Hospital. All rights reserved. | Designed & Developed by 
              <a href="https://codemic.in" className="inline-block align-middle" target="_blank" rel="noopener noreferrer">
                <img 
                  src="/codemic.png" 
                  alt="Codemic" 
                  className="h-6 inline-block ml-1" 
                  style={{ verticalAlign: 'middle' }}
                />
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};