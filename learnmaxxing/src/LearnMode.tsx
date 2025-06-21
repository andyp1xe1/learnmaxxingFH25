import { useState } from 'react';
import BackButton from './BackButton';

function LearnMode(){
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentCard, setCurrentCard] = useState(0);


    const flashcards = [
    {
        id: 1,
        question: "What is the primary function of mitochondria in cells?",
        answer: "Energy production through cellular respiration",
        context: "Mitochondria are often called the 'powerhouses' of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP), which is used as a source of chemical energy.",
        source: "Biology Textbook Chapter 4: Cell Structure"
    },
    {
        id: 2,
        question: "Define photosynthesis and its importance.",
        answer: "The process by which plants convert light energy into chemical energy",
        context: "Photosynthesis is crucial for life on Earth as it produces oxygen and glucose, forming the base of most food chains and maintaining atmospheric oxygen levels.",
        source: "Botany Reference Guide Section 2.1"
    }
    ];

    const handleNext = () => {
        if (currentCard < flashcards.length - 1) {
            setCurrentCard(currentCard + 1);
            setIsFlipped(false);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className=" min-h-screen bg-gradient-to-br from-orange-200 via-purple-200 to-purple-300 p-4">
            <div className="max-w-4xl mx-auto">
        {/* Header */}
            <div className="flex items-center justify-between mb-8">
            <BackButton to='/modeselection' />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-400 bg-clip-text text-transparent">
            Learn Mode
            </h1>
            <div className="text-gray-600">
                {currentCard + 1} / {flashcards.length}
            </div>
        </div>

        {/* Flashcard */}
        <div className="mt-20 flex justify-center mb-8">
            <div className="relative w-full max-w-2xl h-96">
            <div 
                className="absolute inset-0 w-full h-full transition-transform duration-700 ease-in-out"
                style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
            >
              {/* Front of card (Question) */}
                <div 
                    className="absolute inset-0 w-full h-full"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                <div className="bg-white rounded-3xl shadow-2xl p-8 h-full flex flex-col justify-center items-center text-center">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Question</h2>
                    <p className="text-lg text-gray-700 mb-8">
                    {flashcards[currentCard].question}
                    </p>
                </div>
                </div>

              {/* Back of card (Answer) */}
                <div 
                    className="absolute inset-0 w-full h-full"
                    style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                }}
                >
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl shadow-2xl p-8 h-full flex flex-col justify-center">
                    <h2 className="text-2xl font-bold mb-4 text-green-800">Answer</h2>
                    <div className="bg-white rounded-2xl p-6 mb-4">
                    <p className="text-lg text-gray-800 mb-4">
                        {flashcards[currentCard].answer}
                    </p>
                    </div>
                    <div className="bg-green-100 rounded-2xl p-4 mb-4">
                        <h3 className="font-semibold text-green-800 mb-2">Context</h3>
                        <p className="text-sm text-green-700">
                        {flashcards[currentCard].context}
                    </p>
                    </div>
                    <div className="text-xs text-green-600">
                        Source: {flashcards[currentCard].source}
                    </div>
                    </div>
                </div>
            </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
            <button
            onClick={handleFlip}
            className="bg-white text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
            {isFlipped ? 'Show Question' : 'Show Answer'}
            </button>
            <button
            onClick={handleNext}
            disabled={currentCard >= flashcards.length - 1}
            className="bg-gradient-to-r from-purple-600 to-orange-400 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
            Next Card
            </button>
        </div>
        </div>
    </div>
);
};

export default LearnMode;