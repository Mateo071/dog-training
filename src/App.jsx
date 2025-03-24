import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Contact from './components/Contact';
import CTA from './components/CTA';
import Programs from './components/Programs';
import Tips from './components/Tips';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import SuccessStories from './components/SuccessStories';
import SuccessStory from './components/SuccessStory';
import AllSuccessStories from './components/AllSuccessStories';
import GoogleReviews from './components/GoogleReviews';
import AboutUs from './components/AboutUs';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhyUs from './components/WhyUs';
import TipArticle from './components/TipArticle';
import MobileNav from './components/MobileNav';

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

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path='/admin' Component={() => {
          window.location.href='https://natural-melody-8463e9c17b.strapiapp.com/admin';
          return null;
        }} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}

function MainLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
 
    window.addEventListener('resize', handleResize);
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      <ParallaxShapes />
      {
        isMobile &&
          <MobileNav />
        ||
          <Navbar />
      }
      <main className="container mx-auto px-4 pt-16 pb-8 flex-grow">
        <Routes>
          <Route path="/about" element={<AboutUs />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/tips/:id" element={<TipArticle />} />
          <Route path="/success-stories" element={<AllSuccessStories />} />
          <Route path="/success-stories/:id" element={<SuccessStory />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/" element={
            <>
              <Hero />
              <Testimonials />
              <SuccessStories limit={3} />
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