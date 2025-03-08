import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import WhyUs from './components/WhyUs';

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

export default App;