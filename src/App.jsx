import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Admin, Resource, ListGuesser } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';
import { StyledEngineProvider } from '@mui/material/styles';
import { useEffect } from 'react';
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
import WhyUs from './components/WhyUs';
import AboutUs from './components/AboutUs';

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

function ParallaxShapes() {
  useEffect(() => {
    const handleParallax = (e) => {
      const shapes = document.querySelectorAll('.parallax-shape');
      shapes.forEach(shape => {
        const speed = shape.getAttribute('data-speed') || 0.2;
        const x = (window.innerWidth - e.pageX * speed) / 100;
        const y = (window.innerHeight - e.pageY * speed) / 100;
        shape.style.transform = `translateX(${x}px) translateY(${y}px)`;
      });
    };

    document.addEventListener('mousemove', handleParallax);
    return () => document.removeEventListener('mousemove', handleParallax);
  }, []);

  return (
    <>
      <div className="parallax-shape shape-1" data-speed="0.2"></div>
      <div className="parallax-shape shape-2" data-speed="0.3"></div>
      <div className="parallax-shape shape-3" data-speed="0.1"></div>
    </>
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
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      <ParallaxShapes />
      <Navbar />
      <main className="container mx-auto px-4 pt-16 pb-8 flex-grow">
        <Routes>
          <Route path="/about" element={<AboutUs />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/" element={
            <>
              <MainHeading />
              <Testimonials />
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 pointer-events-none"></div>
                <SuccessStories />
              </div>
              <CTA />
              <WhyUs />
              <GoogleReviews />
            </>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App