import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BackButton from './BackButton';
import { apiService } from './services/api';
import type { Question } from './services/api';

interface Flashcard {
    id: number;
    question: string;
    answer: string;        // The actual answer text (not just A, B, C)
    context: string;       // The explanation/context
    source: string;        // The source/topic
}

interface DifficultyResponse {
    cardId: number;
    difficulty: 'hard' | 'ok' | 'easy';
    timestamp: string;
}

function LearnMode() {
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [difficultyResponses, setDifficultyResponses] = useState<DifficultyResponse[]>([]);
    const [showDifficulty, setShowDifficulty] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [cardQueue, setCardQueue] = useState<number[]>([]);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const location = useLocation();
    const topic = location.state?.topic;

    // Fetch questions on component mount
    useEffect(() => {
        const fetchQuestions = async () => {
            if (!topic) {
                setError('No topic selected');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const questionsData = await apiService.getQuizQuestions(topic.id);
                
                // Transform the data to match the expected format
                const transformedFlashcards: Flashcard[] = questionsData.map((q: Question) => {
                    // Get the actual answer text from answerOptions using correctAnswer letter
                    const correctAnswerLetter = q.question_json.correctAnswer;
                    const actualAnswerText = q.question_json.answerOptions[correctAnswerLetter as keyof typeof q.question_json.answerOptions];
                    
                    return {
                        id: q.id,
                        question: q.question_json.question,
                        answer: actualAnswerText || q.question_json.correctAnswer, // Use actual text, fallback to letter
                        context: q.explanation || 'No additional context available',
                        source: topic.title
                    };
                });
                
                setFlashcards(transformedFlashcards);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch questions');
                // Fallback to placeholder data
                setFlashcards([
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
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [topic]);

    // Calculate difficulty counts
    const difficultyCounts = {
        hard: difficultyResponses.filter(r => r.difficulty === 'hard').length,
        ok: difficultyResponses.filter(r => r.difficulty === 'ok').length,
        easy: difficultyResponses.filter(r => r.difficulty === 'easy').length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading flashcards...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error: {error}</p>
                    <BackButton to="/groups" />
                </div>
            </div>
        );
    }

    if (flashcards.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">No flashcards available for this topic.</p>
                    <BackButton to="/groups" />
                </div>
            </div>
        );
    }

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleShowDifficulty = () => {
        setShowDifficulty(true);
    };

    const handleDifficultyResponse = (difficulty: 'hard' | 'ok' | 'easy') => {
        const currentCard = flashcards[currentCardIndex];
        const response: DifficultyResponse = {
            cardId: currentCard.id,
            difficulty,
            timestamp: new Date().toISOString()
        };

        setDifficultyResponses(prev => [...prev, response]);

        // If hard, add to queue for review
        if (difficulty === 'hard') {
            setCardQueue(prev => [...prev, currentCard.id]);
        }

        // Move to next card or complete
        if (currentCardIndex < flashcards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            setIsFlipped(false);
            setShowDifficulty(false);
        } else {
            setIsCompleted(true);
        }
    };

    const handleAgain = () => {
        const currentCard = flashcards[currentCardIndex];
        setCardQueue(prev => [...prev, currentCard.id]);
        setShowDifficulty(false);
        setIsFlipped(false);
    };

    const handleBackToMain = () => {
        // Navigate back to main page
        window.location.href = '/';
    };

    // Completion page
    if (isCompleted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-200 via-purple-200 to-purple-300 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <BackButton to='/modeselection' state={{ topic }} />
                        <h1 className="font-playfair text-4xl font-bold bg-[linear-gradient(to_right,#6a29ab,#fca95b)] bg-clip-text text-transparent">
                            Completed!
                        </h1>
                        <div></div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                        <div className="text-6xl mb-6">🎉</div>
                        <h2 className="font-playfair text-3xl font-bold mb-4 text-gray-800">
                            Great job!
                        </h2>
                        <p className="font-inter text-lg text-gray-600 mb-8">
                            You've completed all the flashcards in this session.
                        </p>

                        {/* Difficulty Summary */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-red-50 rounded-xl p-4">
                                <div className="text-2xl font-bold text-red-400">{difficultyCounts.hard}</div>
                                <div className="text-sm text-red-500 font-inter">Hard</div>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-4">
                                <div className="text-2xl font-bold text-amber-400">{difficultyCounts.ok}</div>
                                <div className="text-sm text-amber-500 font-inter">OK</div>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4">
                                <div className="text-2xl font-bold text-green-400">{difficultyCounts.easy}</div>
                                <div className="text-sm text-green-500 font-inter">Easy</div>
                            </div>
                        </div>

                        {cardQueue.length > 0 && (
                            <div className="bg-blue-50 rounded-xl p-4 mb-8">
                                <p className="font-inter text-blue-800">
                                    {cardQueue.length} card{cardQueue.length !== 1 ? 's' : ''} marked for review
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleBackToMain}
                            className="bg-gradient-to-r from-purple-600 to-orange-400 hover:from-purple-700 hover:to-orange-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                            Back to Main
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-purple-200 to-purple-300 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <BackButton to='/modeselection' state={{ topic }} />
                    <h1 className="font-playfair text-4xl font-bold bg-[linear-gradient(to_right,#6a29ab,#fca95b)] bg-clip-text text-transparent">
                        Learn Mode
                    </h1>
                    <div className="text-gray-600 font-inter">
                        {currentCardIndex + 1} / {flashcards.length}
                    </div>
                </div>

                {/* Difficulty Counter */}
                <div className="flex justify-center mb-6">
                    <div className="bg-white rounded-xl shadow-lg p-4 flex space-x-6">
                        <div className="text-center">
                            <div className="text-lg font-bold text-red-400">{difficultyCounts.hard}</div>
                            <div className="text-xs text-red-500 font-inter">Hard</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-amber-400">{difficultyCounts.ok}</div>
                            <div className="text-xs text-amber-500 font-inter">OK</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-400">{difficultyCounts.easy}</div>
                            <div className="text-xs text-green-500 font-inter">Easy</div>
                        </div>
                    </div>
                </div>

                {/* Flashcard */}
                <div className="mt-8 flex justify-center mb-8">
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
                                    <h2 className="font-playfair text-4xl font-bold mb-6 text-gray-800">Question</h2>
                                    <p className="font-inter text-xl text-gray-700 mb-8">
                                        {flashcards[currentCardIndex].question}
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
                                    <h2 className="font-playfair text-2xl font-bold mb-4 text-green-800">Answer</h2>
                                    <div className="bg-white rounded-2xl p-6 mb-4">
                                        <p className="font-inter text-lg text-gray-800 mb-4">
                                            {flashcards[currentCardIndex].answer}
                                        </p>
                                    </div>
                                    <div className="bg-green-100 rounded-2xl p-4 mb-4">
                                        <h3 className="font-playfair font-semibold text-green-800 mb-2">Explanation</h3>
                                        <p className="font-inter text-sm text-green-700">
                                            {flashcards[currentCardIndex].context}
                                        </p>
                                    </div>
                                    <div className="font-inter text-xs text-green-600">
                                        Source: {flashcards[currentCardIndex].source}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                {!showDifficulty ? (
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleFlip}
                            className="bg-white text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-inter"
                        >
                            {isFlipped ? 'Show Question' : 'Show Answer'}
                        </button>
                        {isFlipped && (
                            <button
                                onClick={handleShowDifficulty}
                                className="bg-gradient-to-r from-purple-600 to-orange-400 hover:from-purple-700 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-inter"
                            >
                                Continue
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="text-center mb-4">
                            <h3 className="font-inter text-xl font-semibold text-gray-800 mb-2">
                                How well did you know this?
                            </h3>
                        </div>
                        
                        {/* Difficulty Buttons */}
                        <div className="flex space-x-4 mb-4">
                            <button
                                onClick={handleAgain}
                                className="bg-gradient-to-r from-purple-300 to-purple-400 hover:from-purple-400 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-inter"
                            >
                                Again
                            </button>
                            <button
                                onClick={() => handleDifficultyResponse('hard')}
                                className="bg-gradient-to-r from-red-300 to-red-400 hover:from-red-400 hover:to-red-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-inter"
                            >
                                Hard
                            </button>
                            <button
                                onClick={() => handleDifficultyResponse('ok')}
                                className="bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-inter"
                            >
                                OK
                            </button>
                            <button
                                onClick={() => handleDifficultyResponse('easy')}
                                className="bg-gradient-to-r from-emerald-300 to-emerald-400 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-inter"
                            >
                                Easy
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LearnMode;