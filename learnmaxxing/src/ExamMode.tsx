import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import { apiService } from './services/api';
import { Trophy, Target } from 'lucide-react';
import { failedQuizzesService } from './services/failedQuizzesService';

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
    topicId?: number; // Add topicId for tracking
}

interface QuestionResult {
    questionId: number;
    success: boolean;
    topicId: number;
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
    const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
    const [isGeneralAssessment, setIsGeneralAssessment] = useState(false);
    const [examCompleted, setExamCompleted] = useState(false);
    
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
                        explanation: q.explanation,
                        topicId: q.quiz_id || q.quizId || q.topic_id || q.topicId || q.id || index + 1 // Use actual quiz ID or question ID as fallback
                    }));
                    setQuestions(questionsFromUpload);
                    
                    // Questions from upload are generated questions (general assessment)
                    console.log('Questions from upload - General Assessment: true');
                    setIsGeneralAssessment(true);
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
                        explanation: q.explanation,
                        topicId: q.topic_id || q.topicId || 1
                    }));
                    
                    setQuestions(transformedQuestions);
                    
                    // Questions from generate-questions API are general assessments
                    console.log('Questions from generate-questions API - General Assessment: true');
                    setIsGeneralAssessment(true);
                }
                // Check if we have a specific topic/quiz to load
                else if (location.state?.topic) {
                    console.log('🔍 ExamMode: Loading questions for topic:', location.state.topic);
                    console.log('🔍 ExamMode: Topic ID:', location.state.topic.id);
                    console.log('🔍 ExamMode: Topic structure:', location.state.topic);
                    
                    const topicQuestions = await apiService.getQuizQuestions(location.state.topic.id);
                    console.log('📦 ExamMode: Questions received from API:', topicQuestions);
                    console.log('📦 ExamMode: Questions count:', topicQuestions.length);
                    
                    // Transform questions to match our interface
                    const transformedQuestions = topicQuestions.map((q) => ({
                        id: q.id,
                        question: q.question_json.question,
                        options: q.question_json.answerOptions,
                        correctAnswer: q.question_json.correctAnswer,
                        explanation: q.explanation,
                        topicId: location.state.topic.id
                    }));
                    
                    console.log('📦 ExamMode: Transformed questions:', transformedQuestions);
                    setQuestions(transformedQuestions);
                    
                    // Questions from existing quiz are single-topic assessments
                    console.log('Questions from existing quiz - General Assessment: false');
                    setIsGeneralAssessment(false);
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
        const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
        if (isCorrect) {
            setScore(score + 1);
        }
        
        // Track the result
        const result: QuestionResult = {
            questionId: questions[currentQuestion].id,
            success: isCorrect,
            topicId: questions[currentQuestion].topicId || 1
        };
        setQuestionResults(prev => [...prev, result]);
        } else {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer('');
            setShowResult(false);
        } else {
            // Exam completed - handle navigation
            handleExamCompletion();
        }
    }
    };

    const handleExamCompletion = () => {
        console.log('Exam completed. Assessment type:', {
            isGeneralAssessment,
            questionSource: location.state?.questions ? 'upload' : 
                           location.state?.selectedTopics ? 'generate-questions' : 
                           location.state?.topic ? 'existing-quiz' : 'unknown',
            totalQuestions: questions.length,
            score: score
        });

        if (isGeneralAssessment) {
            // Navigate to AssessmentResults with the question results
            console.log('Navigating to AssessmentResults for general assessment');
            navigate('/assestmentresults', { 
                state: { 
                    questionResults,
                    isGeneralAssessment: true
                } 
            });
        } else {
            // For single topic, show completion screen
            console.log('Showing completion screen for single-topic assessment');
            setExamCompleted(true);
        }
    };

    // Completion screen for single-topic assessments
    if (examCompleted) {
        const percentage = Math.round((score / questions.length) * 100);
        const getPerformanceLevel = (score: number) => {
            if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
            if (score >= 80) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
            if (score >= 70) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
            return { level: 'Needs Work', color: 'text-red-600', bgColor: 'bg-red-100' };
        };
        const performance = getPerformanceLevel(percentage);



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
                            Exam Complete!
                        </h1>
                        <div></div>
                    </div>

                    {/* Results Card */}
                    <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
                        <div className="text-center">
                            {/* Trophy Icon */}
                            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10 text-white" />
                            </div>

                            {/* Score Display */}
                            <div className="mb-6">
                                <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-orange-400 bg-clip-text text-transparent mb-2">
                                    {percentage}%
                                </div>
                                <p className="text-gray-600 font-medium">Your Score</p>
                            </div>

                            {/* Score Details */}
                            <div className="mb-6">
                                <div className="text-3xl font-bold text-gray-800 mb-2">
                                    {score}/{questions.length}
                                </div>
                                <p className="text-gray-600 font-medium">Questions Correct</p>
                            </div>

                            {/* Performance Level */}
                            <div className="mb-8">
                                <div className={`inline-flex items-center px-6 py-3 rounded-full font-semibold ${performance.bgColor} ${performance.color}`}>
                                    <Target className="w-5 h-5 mr-2" />
                                    {performance.level}
                                </div>
                            </div>

                            {/* Topic Info */}
                            {location.state?.topic && (
                                <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Topic Completed</h3>
                                    <p className="text-gray-600">{location.state.topic.title || location.state.topic.name}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/modeselection', { state: { topic: location.state?.topic } })}
                                    className="bg-gradient-to-r from-purple-600 to-orange-400 hover:from-purple-700 hover:to-orange-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    Try Another Topic
                                </button>
                                <button
                                    onClick={() => navigate('/learnmode', { state: { topic: location.state?.topic } })}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200"
                                >
                                    Study This Topic
                                </button>
                            </div>
                        </div>
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