import { BookOpen,Target, ArrowRight} from 'lucide-react';
import FeatureCard from './FeatureCard';
function Hero() {
    return (
        <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Master Any Subject
            <br />
            <span className="text-4xl md:text-6xl">with Smart Learning</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your study sessions with AI-powered flashcards and adaptive quizzes. 
            Switch between Learn Mode and Exam Mode to maximize your learning potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl flex items-center space-x-2">
                <span>Start Learning Free</span>
                <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 border-2 border-purple-200 text-purple-600 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all">
                Watch Demo
            </button>
            </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
            <FeatureCard
            icon={BookOpen}
            title="Learn Mode"
            description="Master concepts with intelligent flashcards that adapt to your learning pace. Our AI tracks your progress and focuses on areas that need more attention."
            features={[
                "Adaptive spaced repetition",
                "Progress tracking",
                "Personalized study paths"
            ]}
            gradient="bg-gradient-to-r from-purple-500 to-pink-500"
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
            gradient="bg-gradient-to-r from-blue-500 to-indigo-500"
            />
        </div>
        </section>
    );
    };
export default Hero;