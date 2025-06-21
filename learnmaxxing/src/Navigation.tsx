
import { Brain} from 'lucide-react';

function Navigation(){
    return (
        <nav className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-[linear-gradient(to_right,#6a29ab,#fca95b)] rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-playfair text-2xl font-bold bg-[linear-gradient(to_right,#6a29ab,#fca95b)] bg-clip-text text-transparent">
            LEARNMAXXING
            </span>
        </div>
        
        <div className="flex items-center space-x-4">
            <button className="font-inter px-6 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors">
            Login
            </button>
            <button className="font-inter px-6 py-2 bg-[linear-gradient(to_left,#6a29ab,#fca95b)] text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium transition-all transform hover:scale-105 shadow-lg">
            Sign Up
            </button>
        </div>
        </nav>
    );
};
export default Navigation;