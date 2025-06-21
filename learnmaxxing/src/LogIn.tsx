
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-purple-200 to-purple-300 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-orange-400 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
            </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-orange-400 bg-clip-text text-transparent font-playfair">
            LEARNMAXXING
            </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-playfair font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-orange-400 bg-clip-text text-transparent">
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
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-inter"
                placeholder="Enter your password"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
            </div>

            <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-orange-400 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-inter"
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
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200"
            >
                Sign up
            </button>
            </p>
        </div>
        </div>
    </div>
);
};

export default LogIn;
