
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';
import { Brain } from 'lucide-react';
import BackButton from './BackButton';
type LogInProps = {
    onLogin: (credentials: { username: string; password: string }) => void;
    };
function LogIn({ onLogin}:LogInProps){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
        onLogin({ username, password });
        navigate('/dashboard');
    }
    };

    return (
        <>
        <BackButton to="/" />
        <div className="rounded-xl w-full h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 via-pink-200 to-purple-300">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-[linear-gradient(to_right,#6a29ab,#fca95b)] rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-playfair text-2xl font-bold bg-[linear-gradient(to_right,#6a29ab,#fca95b)] bg-clip-text text-transparent">
            LEARNMAXXING
            </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-playfair font-bold text-center mb-2 bg-[linear-gradient(to_right,#6a29ab,#fca95b)] bg-clip-text text-transparent mt-8">
            Welcome Back
        </h1>
        <p className="text-gray-600 text-center mb-8 font-inter">
            Sign in to continue your learning journey
        </p>

        {/* Form */}
        <div className="space-y-6">
            <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Username
            </label>
            <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-inter"
                placeholder="Enter your username"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
            </div>

            <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Password
            </label>
            <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-5 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-inter"
                placeholder="Enter your password"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
            </div>

            <button
            onClick={handleSubmit}
            className="w-full bg-[linear-gradient(to_right,#6a29ab,#fca95b)] text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-inter"
            >
            Sign In
            </button>
        </div>

        {/* Switch to Signup */}
        <div className="mt-6 text-center">
            <p className="text-gray-600 font-inter">
            Don't have an account?{' '}
            <button
                onClick={() => navigate('/signup')}
                className=" hover:text-purple-700 font-semibold transition-colors duration-200"
            >
                Sign up
            </button>
            </p>
        </div>
        </div>
    </div>
    </>
    
);
};

export default LogIn;
