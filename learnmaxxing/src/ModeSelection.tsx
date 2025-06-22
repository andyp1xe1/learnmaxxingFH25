import { useNavigate, useLocation } from "react-router-dom";
import { Brain } from "lucide-react";
import BackButton from './BackButton';

function ModeSelection() {
    const navigate = useNavigate();
    const location = useLocation();
    const topic = location.state?.topic;
    
    const handleModeSelect = (mode: 'learn' | 'exam') => {
        console.log('User selected mode:', mode);
        console.log('Topic being passed:', topic);
    
        if (mode === 'learn') {
            navigate('/learnmode', { state: { topic } });
        } else if (mode === 'exam') {
            navigate('/exammode', { state: { topic } });
        }
        };
    return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-purple-200 to-purple-300 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
        <BackButton to="/groups" />
        {/* Logo and Header */}
        <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
            <div className="w-10 h-10 bg-[linear-gradient(to_right,#6a29ab,#fca95b)] rounded-xl flex items-center justify-center mr-2">
                        <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-4xl font-bold bg-[linear-gradient(to_right,#6a29ab,#fca95b)] bg-clip-text text-transparent font-playfair">
                LEARNMAXXING
            </span>
            </div>
            <h1 className="text-4xl font-playfair font-bold mb-4 bg-[linear-gradient(to_right,#6a29ab,#fca95b)] bg-clip-text text-transparent">
            Choose Your Learning Mode
            </h1>
            <p className="text-gray-600 text-lg font-inter">
                Select the mode that fits your current learning goals
            </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Learn Mode Card */}
            <button
                onClick={() => handleModeSelect('learn')}
                className="bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
            >
            <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
            </div>
            <h3 className="text-2xl font-playfair font-bold mb-4 text-gray-800">Learn Mode</h3>
            <p className="text-gray-600 font-inter mb-6">
                Master concepts with intelligent flashcards that adapt to your learning pace. Focus on understanding and retention.
            </p>
            <div className="space-y-2 text-sm text-gray-500 font-inter">
                <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Adaptive spaced repetition
                </div>
                <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Detailed explanations
                </div>
                <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Self-paced learning
                </div>
            </div>
            </button>

          {/* Exam Mode Card */}
            <button
            onClick={() => handleModeSelect('exam')}
            className="bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
            >
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            </div>
            <h3 className="text-2xl font-playfair font-bold mb-4 text-gray-800">Exam Mode</h3>
            <p className="text-gray-600 font-inter mb-6">
                Test your knowledge with realistic quiz scenarios that simulate actual exam conditions. Build confidence and identify gaps.
            </p>
            <div className="space-y-2 text-sm text-gray-500 font-inter">
                <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Timed practice tests
                </div>
                <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Performance analytics
                </div>
                <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Weakness identification
                </div>
            </div>
            </button>
        </div>
        </div>
    </div>
);
};
export default ModeSelection;