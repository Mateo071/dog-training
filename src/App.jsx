import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Contact from './components/pages/Contact';
import CTA from './components/ui/CTA';
import Programs from './components/pages/Programs';
import Tips from './components/pages/Tips';
import Testimonials from './components/pages/Testimonials';
import Footer from './components/ui/Footer';
import SuccessStories from './components/pages/SuccessStories';
import SuccessStory from './components/content/SuccessStory';
import AllSuccessStories from './components/pages/AllSuccessStories';
// import GoogleReviews from './components/ui/GoogleReviews';
import AboutUs from './components/pages/AboutUs';
import Navbar from './components/ui/Navbar';
import Hero from './components/pages/Hero';
import WhyUs from './components/pages/WhyUs';
import TipArticle from './components/content/TipArticle';
import MobileNav from './components/ui/MobileNav';

// Auth components
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './components/Dashboard';
import ContactSubmissions from './components/admin/ContactSubmissions';
import ClientManagement from './components/admin/ClientManagement';
import ClientProfile from './components/admin/ClientProfile';
import EditClientProfile from './components/admin/EditClientProfile';
import AddDog from './components/admin/AddDog';
import CreateClient from './components/admin/CreateClient';
import MessageComposer from './components/admin/MessageComposer';
import MessageTemplates from './components/admin/MessageTemplates';
import MessagesList from './components/admin/MessagesList';
import MessageInbox from './components/client/MessageInbox';
import OnboardingWizard from './components/client/OnboardingWizard';
import SessionSchedule from './components/client/SessionSchedule';
import SessionManagement from './components/admin/SessionManagement';
import SessionScheduler from './components/admin/SessionScheduler';
import PaymentCheckout from './components/client/PaymentCheckout';
import ReferralProgram from './components/client/ReferralProgram';
import DiscountManagement from './components/admin/DiscountManagement';
import WebsiteConfiguration from './components/admin/WebsiteConfiguration';
import Analytics from './components/admin/Analytics';
import NotFound from './components/pages/NotFound';
import Settings from './components/ui/Settings';
import SEO from './components/content/SEO';
import { aboutUsContent, programsContent, successStoriesContent } from './data/seoContent';

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
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Auth routes (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/dashboard/contact-submissions" element={
            <ProtectedRoute adminOnly={true}>
              <ContactSubmissions />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/clients" element={
            <ProtectedRoute adminOnly={true}>
              <ClientManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/clients/create" element={
            <ProtectedRoute adminOnly={true}>
              <CreateClient />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/clients/:id" element={
            <ProtectedRoute adminOnly={true}>
              <ClientProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/clients/:id/edit" element={
            <ProtectedRoute adminOnly={true}>
              <EditClientProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/clients/:clientId/dogs/add" element={
            <ProtectedRoute adminOnly={true}>
              <AddDog />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/messages" element={
            <ProtectedRoute adminOnly={true}>
              <MessagesList />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/messages/compose" element={
            <ProtectedRoute adminOnly={true}>
              <MessageComposer />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/templates" element={
            <ProtectedRoute adminOnly={true}>
              <MessageTemplates />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/sessions" element={
            <ProtectedRoute adminOnly={true}>
              <SessionManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/sessions/create" element={
            <ProtectedRoute adminOnly={true}>
              <SessionScheduler />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/sessions/:id/edit" element={
            <ProtectedRoute adminOnly={true}>
              <SessionScheduler />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/discounts" element={
            <ProtectedRoute adminOnly={true}>
              <DiscountManagement />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/analytics" element={
            <ProtectedRoute adminOnly={true}>
              <Analytics />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/website-config" element={
            <ProtectedRoute adminOnly={true}>
              <WebsiteConfiguration />
            </ProtectedRoute>
          } />
          
          
          {/* Client Routes */}
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingWizard />
            </ProtectedRoute>
          } />
          
          <Route path="/messages" element={
            <ProtectedRoute>
              <MessageInbox />
            </ProtectedRoute>
          } />
          
          <Route path="/sessions" element={
            <ProtectedRoute>
              <SessionSchedule />
            </ProtectedRoute>
          } />
          
          <Route path="/payment" element={
            <ProtectedRoute>
              <PaymentCheckout />
            </ProtectedRoute>
          } />
          
          <Route path="/referrals" element={
            <ProtectedRoute>
              <ReferralProgram />
            </ProtectedRoute>
          } />
          
          {/* Legacy Strapi admin redirect */}
          <Route path='/admin' Component={() => {
            window.location.href='https://natural-melody-8463e9c17b.strapiapp.com/admin';
            return null;
          }} />
          
          {/* Public routes */}
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
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
          <Route path="/about" element={
            <>
              <SEO 
                title={aboutUsContent.seo.title}
                description={aboutUsContent.seo.description}
                keywords={aboutUsContent.seo.keywords}
                url={window.location.origin + '/about'}
              />
              <AboutUs />
            </>
          } />
          <Route path="/programs" element={
            <>
              <SEO 
                title={programsContent.seo.title}
                description={programsContent.seo.description}
                keywords={programsContent.seo.keywords}
                url={window.location.origin + '/programs'}
              />
              <Programs />
            </>
          } />
          <Route path="/tips" element={
            <>
              <SEO 
                title="Dog Training Tips - Expert Advice for Dog Owners"
                description="Free dog training tips and advice from professional trainers. Learn effective techniques for training your dog at home with our expert guidance."
                keywords="dog training tips, dog training advice, how to train dog, dog behavior tips, puppy training tips"
                url={window.location.origin + '/tips'}
              />
              <Tips />
            </>
          } />
          <Route path="/tips/:id" element={<TipArticle />} />
          <Route path="/success-stories" element={
            <>
              <SEO 
                title={successStoriesContent.seo.title}
                description={successStoriesContent.seo.description}
                keywords={successStoriesContent.seo.keywords}
                url={window.location.origin + '/success-stories'}
              />
              <AllSuccessStories />
            </>
          } />
          <Route path="/success-stories/:id" element={<SuccessStory />} />
          {/* SEO-friendly individual success story routes */}
          <Route path="/success-stories/tito-pit-bull-terrier-mix" element={<SuccessStory />} />
          <Route path="/success-stories/simba-cockapoo" element={<SuccessStory />} />
          <Route path="/success-stories/maple-miniature-australian-shepherd" element={<SuccessStory />} />
          <Route path="/success-stories/layla-golden-doodle" element={<SuccessStory />} />
          <Route path="/contact" element={
            <>
              <SEO 
                title="Contact Flores Dog Training - Get Started Today"
                description="Ready to start your dog's training journey? Contact our professional dog trainers today for a consultation and personalized training plan."
                keywords="contact dog trainer, dog training consultation, book dog training, professional dog trainer contact"
                url={window.location.origin + '/contact'}
              />
              <Contact />
            </>
          } />
          <Route path="/" element={
            <>
              <SEO 
                title="Flores Dog Training - Professional Dog Training Services"
                description="Transform your dog's behavior with expert training from Flores Dog Training. Personalized programs, proven techniques, and caring professionals. Get started today!"
                keywords="dog training, puppy training, dog behavior, obedience training, professional dog trainer, dog training services"
                url={window.location.origin}
                structuredData={{
                  "@context": "https://schema.org",
                  "@type": "LocalBusiness",
                  "name": "Flores Dog Training",
                  "description": "Professional dog training services specializing in behavior modification, obedience training, and puppy training.",
                  "url": window.location.origin,
                  "telephone": "+1-XXX-XXX-XXXX",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Your City",
                    "addressRegion": "Your State",
                    "addressCountry": "US"
                  },
                  "serviceType": ["Dog Training", "Puppy Training", "Behavior Modification", "Obedience Training"],
                  "areaServed": "Your Service Area",
                  "priceRange": "$$"
                }}
              />
              <Hero />
              <Testimonials />
              <SuccessStories limit={3} />
              <CTA />
              <WhyUs />
              {/* <GoogleReviews /> */}
            </>
          } />
          {/* 404 Not Found - catch all unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App