import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; 

type BackButtonProps = {
  to: string; 
  state?: any;
};

const BackButton: React.FC<BackButtonProps> = ({ to, state }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = () => {
        // If we have specific state to pass, use it; otherwise pass current state
        const navigationState = state || location.state;
        navigate(to, { state: navigationState });
    };

    return (
    <button
        onClick={handleClick}
        className="font-inter font-bold ml-5 flex items-center space-x-2 text-gray-600 hover:text-purple-800 font-medium text-sm absolute top-4 left-4"
    >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
    </button>
    );
};

export default BackButton;
