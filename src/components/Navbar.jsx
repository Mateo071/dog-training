import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  return (
    <header 
      className={`fixed top-0 left-0 w-full bg-brand-blue shadow-lg z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-white hover:text-gray-100 transition-colors">
            Flores Dog Training
          </Link>
          <nav className="flex space-x-8">
            <Link to="/about" className="text-white font-medium hover:text-gray-100 transition-colors">About</Link>
            <Link to="/programs" className="text-white font-medium hover:text-gray-100 transition-colors">Programs</Link>
            <Link to="/tips" className="text-white font-medium hover:text-gray-100 transition-colors">Tips</Link>
            <Link to="/contact" className="text-white font-medium hover:text-gray-100 transition-colors">Contact</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;