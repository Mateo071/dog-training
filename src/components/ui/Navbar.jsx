import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../data/routes';
import { NavLink } from 'react-router-dom';
import { analytics } from '../../configuration.jsx';
import { logEvent } from 'firebase/analytics';

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
          <Link
            to='/'
            className='text-2xl font-bold text-white hover:text-gray-100 transition-colors'
            onClick={() => {
              if (analytics) {
                logEvent(analytics, 'select_content', {
                  content_type: 'navigation',
                  item_id: 'home_logo'
                });
              }
            }}
          >
            Flores Dog Training
          </Link>
          <nav className='flex space-x-8'>
            {
              routes.map(route => (
                <NavLink
                  to={route.path}
                  key={route.id}
                  className="relative text-white hover:text-gray-100 transition-colors"
                  onClick={() => {
                    if (analytics) {
                      logEvent(analytics, 'select_content', {
                        content_type: 'navigation',
                        item_id: route.path,
                        item_name: route.name
                      });
                    }
                  }}
                >
                  {({ isActive }) => (
                    <>
                      {/* Invisible bold text to reserve space */}
                      <span className="invisible font-bold" aria-hidden="true">
                        {route.name}
                      </span>
                      {/* Visible text with actual weight */}
                      <span className={`absolute inset-0 ${isActive ? 'font-bold' : 'font-medium'}`}>
                        {route.name}
                      </span>
                    </>
                  )}
                </NavLink>
              ))
            }
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;