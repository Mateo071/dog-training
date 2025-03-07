import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Admin, Resource, ListGuesser } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';
import { StyledEngineProvider } from '@mui/material/styles';
import Contact from './components/Contact';
import CTA from './components/CTA';
import Programs from './components/Programs';
import Tips from './components/Tips';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import SuccessStories from './components/SuccessStories';
import GoogleReviews from './components/GoogleReviews';

const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');

function AdminApp() {
  return (
    <StyledEngineProvider injectFirst>
      <Admin basename="/admin" dataProvider={dataProvider} requireAuth={false}>
        <Resource name="users" list={ListGuesser} />
        <Resource name="posts" list={ListGuesser} />
        <Resource name="comments" list={ListGuesser} />
      </Admin>
    </StyledEngineProvider>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
      <main className="container mx-auto px-4 pt-16 pb-8 flex-grow">
        <Routes>
          <Route path="/about" element={<h2 className="text-3xl font-bold mb-4">About Us</h2>} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/" element={
            <>
              <div 
                className="relative h-[600px] -mx-4 mb-12 flex items-center justify-center bg-cover bg-center"
                style={{
                  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=1920")'
                }}
              >
                <div className="text-center text-white max-w-4xl mx-auto px-4">
                  <h1 className="text-5xl font-bold mb-6">Transform Your Dog's Behavior, Transform Your Life</h1>
                  <p className="text-xl mb-8">Experience the joy of a well-trained companion. Our proven methods create lasting bonds and happy, obedient dogs that make family life even more wonderful.</p>
                  <Link 
                    to="/programs" 
                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Explore Our Programs
                  </Link>
                </div>
              </div>
              <SuccessStories />
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
              <GoogleReviews />
              <Testimonials />
            </>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;