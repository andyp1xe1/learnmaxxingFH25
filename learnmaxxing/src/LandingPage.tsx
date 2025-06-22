
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import Hero from './Hero';
import HowItWorksSection from './HowItWorksSection';
import CTASection from './CTASection';
import Footer from './Footer';
import { apiService } from './services/api';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, redirect to groups page
    if (apiService.isAuthenticated()) {
      navigate('/groups', { replace: true });
    }
  }, [navigate]);

  // Show loading while checking auth status
  // Skip loading state as basic auth is instant

  // Only show landing page if user is not authenticated
  // Skip this check as basic auth redirects immediately via useEffect

  return (
    <>
    <div className = 'rounded-xl max-w-350 mx-auto px-4 bg-gradient-to-br from-purple-50 via-white to-blue-50'>
    <Navigation />
    <Hero />
    <HowItWorksSection />
    <CTASection />
    <Footer />
  </div>
  </>
    
  );
}