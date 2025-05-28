import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const Navbar = () => {
  const { isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (location.pathname === '/' || !isAuthenticated) {
    return null;
  }

  const handleSignOut = () => {
    setShowMobileMenu(false);
    signOut();
  };
  
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white shadow-lg py-2' 
          : 'bg-white py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4">
            <button
              onClick={signOut}
              className="flex items-center px-4 py-2 rounded-xl transition-all duration-300 text-slate-700 hover:bg-slate-100"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span className="font-medium">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="sm:hidden p-2 rounded-lg transition-colors text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {showMobileMenu ? (
              <CloseIcon className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="sm:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;