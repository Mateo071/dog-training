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
import Navbar from './components/Navbar';
import MainHeading from './components/MainHeading';

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
      <Navbar />
      <main className="container mx-auto px-4 pt-16 pb-8 flex-grow">
        <Routes>
          <Route path="/about" element={<h2 className="text-3xl font-bold mb-4">About Us</h2>} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/" element={
            <>
              <MainHeading />
              <Testimonials />
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
            </>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;