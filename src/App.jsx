import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Contact from './components/Contact';
import CTA from './components/CTA';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
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
              </nav>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 pt-20 pb-8">
          <Routes>
            <Route path="/about" element={<h2 className="text-3xl font-bold mb-4">About Us</h2>} />
            <Route path="/programs" element={<h2 className="text-3xl font-bold mb-4">Our Programs</h2>} />
            <Route path="/tips" element={<h2 className="text-3xl font-bold mb-4">Training Tips</h2>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/" element={
              <>
                <h2 className="text-3xl font-bold mb-4">Welcome</h2>
                <CTA />
                <section className="bg-teal-600 rounded-lg shadow-lg mt-8 p-8">
                  <h2 className="text-3xl font-bold text-white mb-6">Why Us</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-white">
                      <h3 className="text-xl font-semibold mb-2">Expert Training</h3>
                      <p>Professional trainers with years of experience in dog behavior and training techniques.</p>
                    </div>
                    <div className="text-white">
                      <h3 className="text-xl font-semibold mb-2">Personalized Approach</h3>
                      <p>Customized training programs tailored to your dog's specific needs and personality.</p>
                    </div>
                    <div className="text-white">
                      <h3 className="text-xl font-semibold mb-2">Proven Results</h3>
                      <p>Successful track record of helping dogs and their owners achieve their training goals.</p>
                    </div>
                  </div>
                </section>
              </>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;