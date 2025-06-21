
import Navigation from './Navigation';
import Hero from './Hero';
import StatsSection from './StatsSection';
import HowItWorksSection from './HowItWorksSection';
import CTASection from './CTASection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
    <Navigation />
    <Hero />
    <StatsSection />
    <HowItWorksSection />
    <CTASection />
    <Footer />
  </div>
  </>
    
  );
}