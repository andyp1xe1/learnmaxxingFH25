import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import { apiService } from './services/api';

interface Question {
    id: number;
    question: string;
    options: {
        A: string;
        B: string;
        C: string;
    };
    correctAnswer: string;
    explanation?: string;
}

function ExamMode(){
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const location = useLocation();
    const navigate = useNavigate();

    // Load questions when component mounts
    useEffect(() => {
        const loadQuestions = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check if we have state from FileUploadModal with generated questions
                if (location.state?.questions) {
                    console.log('Using questions from upload:', location.state.questions);
                    const questionsFromUpload = location.state.questions.map((q: any, index: number) => ({
                        id: q.id || index + 1,
                        question: q.question_json?.question || q.question,
                        options: q.question_json?.answerOptions || q.answerOptions || q.options,
                        correctAnswer: q.question_json?.correctAnswer || q.correctAnswer,
                        explanation: q.explanation
                    }));
                    setQuestions(questionsFromUpload);
                } 
                // Check if we have selected topics from topic selection
                else if (location.state?.selectedTopics) {
                    console.log('Generating questions for selected topics:', location.state.selectedTopics);
                    
                    // Prepare selections for the generate-questions endpoint
                    const selections = location.state.selectedTopics.flatMap((topic: any) => 
                        topic.contentIds.map((contentId: number) => ({
                            groupId: location.state.groupId || 1, // fallback to groupId 1
                            topicId: topic.topicId,
                            contentId: contentId
                        }))
                    );
                    
                    console.log('API selections:', selections);
                    const response = await apiService.generateQuestions(selections);
                    console.log('Generated questions response:', response);
                    
                    // Transform response to match our Question interface
                    const transformedQuestions = response.map((q: any, index: number) => ({
                        id: q.id || index + 1,
                        question: q.question_json?.question || q.question,
                        options: q.question_json?.answerOptions || q.answerOptions || q.options,
                        correctAnswer: q.question_json?.correctAnswer || q.correctAnswer,
                        explanation: q.explanation
                    }));
                    
                    setQuestions(transformedQuestions);
                }
                // Check if we have a specific topic/quiz to load
                else if (location.state?.topic) {
                    console.log('Loading questions for topic:', location.state.topic);
                    const topicQuestions = await apiService.getQuizQuestions(location.state.topic.id);
                    
                    // Transform questions to match our interface
                    const transformedQuestions = topicQuestions.map((q) => ({
                        id: q.id,
                        question: q.question_json.question,
                        options: q.question_json.answerOptions,
                        correctAnswer: q.question_json.correctAnswer,
                        explanation: q.explanation
                    }));
                    
                    setQuestions(transformedQuestions);
                } else {
                    throw new Error('No questions or topic provided');
                }
                
            } catch (err) {
                console.error('Error loading questions:', err);
                setError(err instanceof Error ? err.message : 'Failed to load questions');
            } finally {
                setLoading(false);
            }
        };

        loadQuestions();
    }, [location.state]);

    // Timer effect
    useEffect(() => {
        if (timeLeft > 0 && !showResult && questions.length > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
        }
    }, [timeLeft, showResult, questions.length]);

    const formatTime = (seconds:number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (answer:string) => {
        if (!showResult) {
        setSelectedAnswer(answer);
        }
    };

    const handleNext = () => {
        if (!showResult) {
        setShowResult(true);
        if (selectedAnswer === questions[currentQuestion].correctAnswer) {
            setScore(score + 1);
        }
        } else {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer('');
            setShowResult(false);
        }
    }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-purple-200 to-purple-300 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <BackButton 
                to={location.state?.fromUpload ? '/groups' : '/modeselection'} 
                state={location.state?.fromUpload ? undefined : { topic: location.state?.topic }}
            />
            <h1 className="text-4xl font-playfair font-bold bg-[linear-gradient(to_right,#6a29ab,#fca95b)] bg-clip-text text-transparent">
                Exam Mode
            </h1>
            <div className="text-right">
                <div className="text-2xl font-bold text-gray-800 font-inter">{formatTime(timeLeft)}</div>
                <div className="text-sm text-gray-600 font-inter">Time Remaining</div>
            </div>
            </div>

          {/* Progress */}
            <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-inter text-gray-600">Question {currentQuestion + 1} of {questions.length}</span>
                <span className="text-sm font-inter text-gray-600">Score: {score}/{questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                className=" bg-[linear-gradient(to_right,#6a29ab,#fca95b)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
            </div>
            </div>

          {/* Question Card */}
            {loading ? (
              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading questions...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-600 mb-4">Error: {error}</p>
                  <button 
                    onClick={() => navigate(-1)} 
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">No questions available</p>
                  <button 
                    onClick={() => navigate(-1)} 
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            ) : (
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-playfair font-bold mb-6 text-gray-800">
                {questions[currentQuestion].question}
            </h2>

            {/* Answer Options */}
            <div className="space-y-4">
                {Object.entries(questions[currentQuestion].options).map(([key, value]) => {
                let buttonClass = "w-full p-4 text-left border-2 rounded-xl transition-all duration-200 font-inter ";
                
                if (showResult) {
                    if (key === questions[currentQuestion].correctAnswer) {
                    buttonClass += "border-green-500 bg-green-50 text-green-800";
                    } else if (key === selectedAnswer && key !== questions[currentQuestion].correctAnswer) {
                    buttonClass += "border-red-500 bg-red-50 text-red-800";
                    } else {
                    buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
                    }
                    } else {
                    if (selectedAnswer === key) {
                    buttonClass += "border-purple-500 bg-purple-50 text-purple-800";
                    } else {
                    buttonClass += "border-gray-200 hover:border-purple-300 hover:bg-purple-50";
                    }
                }

                return (
                    <button
                    key={key}
                    onClick={() => handleAnswerSelect(key)}
                    className={buttonClass}
                    >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="font-bold mr-3">{key}.</span>
                            <span>{value}</span>
                        </div>
                        {showResult && (
                        <div className="flex items-center">
                            {key === questions[currentQuestion].correctAnswer && (
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            )}
                            {key === selectedAnswer && key !== questions[currentQuestion].correctAnswer && (
                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                            </svg>
                            )}
                        </div>
                        )}
                    </div>
                    </button>
                );
                })}
            </div>
            </div>
            )}

          {/* Next Button */}
            <div className="flex justify-center">
            <button
                onClick={handleNext}
                disabled={!selectedAnswer}
                className="bg-[linear-gradient(to_right,#6a29ab,#fca95b)] text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-inter disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                {showResult ? (currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Exam') : 'Submit Answer'}
            </button>
            </div>
        </div>
        </div>
    );
};
export default ExamMode;