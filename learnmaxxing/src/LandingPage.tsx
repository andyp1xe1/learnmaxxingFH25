
import Navigation from './Navigation';
import Hero from './Hero';
import HowItWorksSection from './HowItWorksSection';
import CTASection from './CTASection';
import Footer from './Footer';

export default function LandingPage() {
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