import { BookOpen,Target, ArrowRight} from 'lucide-react';
import FeatureCard from './FeatureCard';
import { useNavigate } from 'react-router-dom';
function Hero() {
    const navigate = useNavigate();
    return (
        <section className="px-6 py-20 max-w-7xl mx-auto rounded-2xl">
        <div className="text-center mb-16">
            <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-6 bg-[linear-gradient(to_right,#6a29ab,#fca95b)] to-indigo-600 bg-clip-text text-transparent leading-tight">
            Master Any Subject
            <br />
            <span className="text-4xl md:text-6xl">with Smart Learning</span>
            </h1>
            <p className="font-inter text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your study sessions with AI-powered flashcards and adaptive quizzes. 
            Switch between <span className='font-bold '>Learn</span> Mode and <span className='font-bold'>Exam</span> Mode to maximize your learning potential.
            </p>
            <div className="font-inter flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={() => navigate('/signup')} className="font-inter px-8 py-4 bg-[linear-gradient(to_right,#6a29ab,#fca95b)] text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl flex items-center space-x-2">
                <span>Start Learning Free</span>
                <ArrowRight className="w-5 h-5" />
            </button>
            </div>
        </div>

        {/* Feature Cards */}
        <div className="font-inter grid md:grid-cols-2 gap-8 mb-20">
            <FeatureCard
            icon={BookOpen}
            title="Learn Mode"
            description="Master concepts with intelligent flashcards that adapt to your learning pace. Our AI tracks your progress and focuses on areas that need more attention."
            features={[
                "Adaptive spaced repetition",
                "Progress tracking",
                "Personalized study paths"
            ]}
            gradient="bg-[linear-gradient(to_bottom,#f0b25b,#ed9b28)]"
            />
            <FeatureCard
            icon={Target}
            title="Exam Mode"
            description="Test your knowledge with realistic quiz scenarios that simulate actual exam conditions. Build confidence and identify knowledge gaps before the real test."
            features={[
                "Timed practice tests",
                "Detailed performance analytics",
                "Weakness identification"
            ]}
            gradient="bg-[linear-gradient(to_bottom,#6a29ab,#c54ced)]"
            />
        </div>
        </section>
    );
    };
export default Hero;