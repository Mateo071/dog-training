import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Flores Dog Training</h3>
            <p className="text-gray-300">
              Professional dog training services helping create happy, well-behaved companions.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/programs" className="text-gray-300 hover:text-white transition-colors">
                  Training Programs
                </Link>
              </li>
              <li>
                <Link to="/tips" className="text-gray-300 hover:text-white transition-colors">
                  Training Tips
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: info@floresdogtraining.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Location: San Diego, CA</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Flores Dog Training. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;