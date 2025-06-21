import {Brain} from 'lucide-react'
function Footer() {
    return (
        <footer className="px-6 py-12 bg-gray-900 rounded-2xl mt-10">
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r bg-[linear-gradient(to_right,#6a29ab,#fca95b)] rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-playfair text-xl font-bold text-white">LEARNMAXXING</span>
            </div>
            <div className="font-inter flex space-x-6 text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            </div>
            <div className="font-inter border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 LEARNMAXXING. All rights reserved.</p>
            </div>
        </div>
        </footer>
    );
};
export default Footer;