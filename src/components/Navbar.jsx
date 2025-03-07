import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full bg-blue-600 shadow-md z-50">
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
            <Link to="/admin" className="text-white font-medium hover:text-gray-100 transition-colors">Admin</Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Navbar;