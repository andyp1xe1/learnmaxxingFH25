import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; 

type BackButtonProps = {
  to: string; 
};

const BackButton: React.FC<BackButtonProps> = ({ to }) => {
    const navigate = useNavigate();

    return (
    <button
        onClick={() => navigate(to)}
        className="font-inter font-bold ml-5 flex items-center space-x-2 text-gray-600 hover:text-purple-800 font-medium text-sm absolute top-4 left-4"
    >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
    </button>
    );
};

export default BackButton;
