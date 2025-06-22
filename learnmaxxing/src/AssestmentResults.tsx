import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Trophy, Target, BookOpen, ArrowRight} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiService } from './services/api';
import type { AssessmentResult } from './services/api';
import { failedQuizzesService } from './services/failedQuizzesService';

interface QuestionResult {
    questionId: number;
    success: boolean;
    topicId: number;
}

function AssessmentResults(){
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quizResults, setQuizResults] = useState<AssessmentResult[]>([]);

    useEffect(() => {
        const loadAssessmentResults = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check if we have question results from ExamMode
                if (location.state?.questionResults && location.state?.isGeneralAssessment) {
                    console.log('Processing question results:', location.state.questionResults);
                    
                    // Call the API endpoint with the question results
                    const results = await apiService.submitTopicFailureData(location.state.questionResults);
                    console.log('API assessment results:', results);
                    
                    setQuizResults(results);
                    
                    // Store failed quizzes in localStorage
                    const failedTopics = results
                        .filter(result => result.failurePercentage > 30) // Consider failed if >30% failure rate
                        .map(result => {
                            // The API groups questions by topicId, but we need the actual quiz ID
                            // For generated questions, the topicId is usually 1, but we need to find the actual quiz
                            // Let's use the first failed question's ID as a reference to find the quiz
                            const failedQuestions = location.state.questionResults.filter((qr: QuestionResult) => !qr.success);
                            const firstFailedQuestionId = failedQuestions.length > 0 ? failedQuestions[0].questionId : 1;
                            
                            // For now, let's assume the quiz ID is the same as the topic ID
                            // In a real implementation, we'd need to query the database to get the actual quiz ID
                            const quizId = 1; // This should be the actual quiz ID from the database
                            
                            return {
                                quizId: quizId,
                                quizName: result.topic,
                                score: Math.round(100 - result.failurePercentage),
                                timestamp: new Date().toISOString(),
                                isGenerated: true
                            };
                        });
                    
                    console.log('🔍 AssessmentResults: Failed topics to store:', failedTopics);
                    
                    if (failedTopics.length > 0) {
                        failedQuizzesService.addFailedQuizzes(failedTopics);
                        console.log('✅ AssessmentResults: Stored failed quizzes in localStorage');
                    } else {
                        console.log('📦 AssessmentResults: No failed topics to store');
                    }
                } else {
                    // Fallback to hardcoded data if no results provided
                    console.log('No question results provided, using fallback data');
                    setQuizResults([
                        {
                            "topic": "JavaScript's Origins and Creators",
                            "failurePercentage": 66.67,
                            "feedback": "Focus on Brendan Eich's role at Netscape and how JavaScript was conceived as a lightweight scripting language *distinct* from Java.",
                            "references": [
                                {
                                    "questionId": 1,
                                    "referenceTitle": "Mozilla Developer Network (MDN) - 'A re-introduction to JavaScript'",
                                    "paragraph": "Mozilla Developer Network (MDN) - 'A re-introduction to JavaScript'"
                                },
                                {
                                    "questionId": 3,
                                    "referenceTitle": "Mozilla Developer Network (MDN) - 'A Short History of JavaScript'",
                                    "paragraph": "Mozilla Developer Network (MDN) - 'A Short History of JavaScript'"
                                }
                            ]
                        },
                        {
                            "topic": "The Evolution and Modern Uses of JavaScript",
                            "failurePercentage": 50,
                            "feedback": "To improve, focus on understanding *how* JavaScript's evolution directly enabled and shaped its vast array of modern uses. Connect its historical development to its current practical applications.",
                            "references": [
                                {
                                    "questionId": 4,
                                    "referenceTitle": "MDN Web Docs: JavaScript history; Wikipedia: JavaScript",
                                    "paragraph": "MDN Web Docs: JavaScript history; Wikipedia: JavaScript"
                                }
                            ]
                        },
                        {
                            "topic": "JavaScript's Event Loop and Asynchronous Behavior",
                            "failurePercentage": 71.43,
                            "feedback": "Revisit how JavaScript handles asynchronous operations via the event loop, callback queue, and microtasks. Pay particular attention to the order of execution in asynchronous code.",
                            "references": [
                                {
                                    "questionId": 7,
                                    "referenceTitle": "MDN Web Docs - 'Concurrency model and Event Loop'",
                                    "paragraph": "The event loop is what allows JavaScript to perform non-blocking operations."
                                },
                                {
                                    "questionId": 9,
                                    "referenceTitle": "JavaScript.info - 'Event Loop'",
                                    "paragraph": "The JavaScript engine executes code, collects and processes events, and executes queued sub-tasks."
                                }
                            ]
                        },
                        {
                            "topic": "JavaScript Data Types and Type Coercion",
                            "failurePercentage": 40,
                            "feedback": "Review the distinctions between primitive and reference types and how type coercion works implicitly in equality comparisons.",
                            "references": [
                                {
                                    "questionId": 11,
                                    "referenceTitle": "MDN Web Docs - 'JavaScript data types and data structures'",
                                    "paragraph": "JavaScript types are dynamic; variables can hold any type at any time."
                                },
                                {
                                    "questionId": 12,
                                    "referenceTitle": "Eloquent JavaScript - 'Types and Type Coercion'",
                                    "paragraph": "JavaScript sometimes converts values implicitly when performing operations."
                                }
                            ]
                        },
                        {
                            "topic": "JavaScript Scope, Hoisting, and Closures",
                            "failurePercentage": 57.14,
                            "feedback": "Deepen your understanding of lexical scope, how variable hoisting affects declarations, and how closures maintain access to outer variables even after their scope has closed.",
                            "references": [
                                {
                                    "questionId": 14,
                                    "referenceTitle": "MDN Web Docs - 'Closures'",
                                    "paragraph": "A closure gives you access to an outer function's scope from an inner function."
                                },
                                {
                                    "questionId": 15,
                                    "referenceTitle": "Eloquent JavaScript - 'Functions as Values'",
                                    "paragraph": "Closures capture and remember variables from their creation context."
                                }
                            ]
                        },
                        {
                            "topic": "DOM Manipulation and Events",
                            "failurePercentage": 30,
                            "feedback": "Brush up on the DOM tree structure, how to select and manipulate DOM elements, and event handling techniques including event bubbling and delegation.",
                            "references": [
                                {
                                    "questionId": 18,
                                    "referenceTitle": "MDN Web Docs - 'Introduction to the DOM'",
                                    "paragraph": "The Document Object Model represents a web page so that programs can change the document structure, style, and content."
                                },
                                {
                                    "questionId": 20,
                                    "referenceTitle": "JavaScript.info - 'Browser Events'",
                                    "paragraph": "Events are a core part of the DOM interaction model, with bubbling and capturing phases."
                                }
                            ]
                        }
                    ]);
                }
            } catch (err) {
                console.error('Error loading assessment results:', err);
                setError(err instanceof Error ? err.message : 'Failed to load assessment results');
                
                // Fallback to hardcoded data on error
                setQuizResults([
                    {
                        "topic": "Assessment Results",
                        "failurePercentage": 50,
                        "feedback": "Unable to load detailed results. Please try again later.",
                        "references": []
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadAssessmentResults();
    }, [location.state]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing your results...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8 mt-7">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-400 rounded-full flex items-center justify-center">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="font-playfair text-4xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent mb-2">
                            Assessment Error
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Unable to load your assessment results
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-100">
                        <div className="text-center">
                            <p className="text-red-600 mb-6 text-lg">Error: {error}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="bg-gradient-to-r from-purple-600 to-orange-400 hover:from-purple-700 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                                >
                                    Retry
                                </button>
                                <button 
                                    onClick={() => navigate('/exammode', { state: location.state })} 
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                                >
                                    Back to Exam
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const data = quizResults;

  // Transform data for radar chart and calculations
    const quizData = data.map(item => ({
    topic: item.topic.length > 20 ? item.topic.substring(0, 20) + '...' : item.topic,
    fullTopic: item.topic,
    score: Math.round(100 - item.failurePercentage),
    failurePercentage: item.failurePercentage,
    feedback: item.feedback,
    references: item.references
    }));

    const overallScore = Math.round(quizData.reduce((sum, item) => sum + item.score, 0) / quizData.length);
    const totalQuestions = data.reduce((sum, item) => sum + item.references.length, 0);
    const correctAnswers = Math.round(totalQuestions * (overallScore / 100));

    const getPerformanceLevel = (score:number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 80) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 70) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Needs Work', color: 'text-red-600', bgColor: 'bg-red-100' };
    };

    const formatFeedback = (feedback:string) => {
    // Convert markdown-style emphasis to HTML
    return feedback.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
            <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-7">
            <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-orange-400 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
            </div>
            </div>
            <h1 className="font-playfair text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-400 bg-clip-text text-transparent mb-2">
            Quiz Results
            </h1>
            <p className="text-gray-600 text-lg">
            {data.length > 0 ? `${data[0].topic.split(' ')[0]} Assessment` : 'Knowledge Assessment'}
            </p>
        </div>

        {/* Overall Score Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-purple-100">
            <div className="space-y-6 items-center">
            <div className="text-center">
                <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-orange-400 bg-clip-text text-transparent mb-2">
                {overallScore}%
                </div>
                <p className="text-gray-600 font-medium">Overall Score</p>
            </div>
            <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                {correctAnswers}/{totalQuestions}
                </div>
                <p className="text-gray-600 font-medium">Questions Correct</p>
            </div>
            <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full font-semibold ${getPerformanceLevel(overallScore).bgColor} ${getPerformanceLevel(overallScore).color}`}>
                <Target className="w-4 h-4 mr-2" />
                {getPerformanceLevel(overallScore).level}
                </div>
            </div>
            </div>
        </div>

        <div className="space-y-6">
          {/* Radar Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
            <h2 className="font-playfair text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Target className="w-6 h-6 mr-2 text-purple-600" />
                Performance by Topic
            </h2>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={quizData}>
                    <PolarGrid gridType="polygon" className="stroke-purple-200" />
                    <PolarAngleAxis 
                    dataKey="topic" 
                    className="fill-gray-600 text-sm font-medium"
                    tick={{ fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    className="fill-gray-400 text-xs"
                    tick={{ fontSize: 10 }}
                    />
                    <Radar
                    name="Score"
                    dataKey="score"
                    stroke="url(#gradient)"
                    fill="url(#gradient)"
                    fillOpacity={0.3}
                    strokeWidth={3}
                    dot={{ fill: '#9333ea', strokeWidth: 2, r: 4 }}
                    />
                    <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#9333ea" />
                        <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                    </defs>
                </RadarChart>
                </ResponsiveContainer>
            </div>
            </div>

          {/* Topic Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
            <h2 className="font-playfair text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-purple-600" />
                Topic Breakdown
            </h2>
            <div className="space-y-4">
                {quizData.map((item, index) => {
                const performance = getPerformanceLevel(item.score);
                return (
                    <div key={index} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-sm" title={item.fullTopic}>
                        {item.topic}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${performance.bgColor} ${performance.color}`}>
                        {item.score}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                        <div 
                        className="bg-gradient-to-r from-purple-600 to-orange-400 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%` }}
                        ></div>
                    </div>
                    <div className="mb-3">
                        <p 
                        className="text-sm text-gray-600 mb-2"
                        dangerouslySetInnerHTML={{ __html: formatFeedback(item.feedback) }}
                        />
                    </div>
                    </div>
                );
                })}
            </div>
            </div>
        </div>

        {/* Feedback and Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8 border border-purple-100">
            <h2 className="font-playfair text-2xl font-bold text-gray-800 mb-6">Personalized Feedback</h2>
            <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Strengths
                </h3>
                <ul className="text-green-700 space-y-2">
                {quizData
                    .filter(item => item.score >= 70)
                    .map((item, index) => (
                    <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <div>
                        <span className="font-medium">{item.fullTopic}</span>
                        <span className="text-green-600 ml-2">({item.score}%)</span>
                        </div>
                    </li>
                    ))}
                {quizData.filter(item => item.score >= 70).length === 0 && (
                    <li className="text-green-600 italic">Keep studying to build your strengths!</li>
                )}
                </ul>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Areas to Improve
                </h3>
                <ul className="text-orange-700 space-y-2">
                {quizData
                    .filter(item => item.score < 70)
                    .map((item, index) => (
                    <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <div>
                        <span className="font-medium">{item.fullTopic}</span>
                        <span className="text-orange-600 ml-2">({item.score}%)</span>
                        </div>
                    </li>
                    ))}
                {quizData.filter(item => item.score < 70).length === 0 && (
                    <li className="text-orange-600 italic">Great job! All topics performed well.</li>
                )}
                </ul>
            </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <button onClick={() => {
                // Get failed topics from original question results
                const failedTopics = location.state?.questionResults 
                    ? Array.from(new Set(
                        location.state.questionResults
                            .filter((result: QuestionResult) => !result.success)
                            .map((result: QuestionResult) => result.topicId)
                        )).map((topicId: unknown) => ({
                            topicId: topicId as number,
                            topicName: quizData.find(item => item.fullTopic.includes((topicId as number).toString()))?.fullTopic || `Topic ${topicId}`,
                            score: quizData.find(item => item.fullTopic.includes((topicId as number).toString()))?.score || 0
                        }))
                    : quizData.filter(item => item.score < 70).map(item => ({
                        topicId: parseInt(item.fullTopic.match(/\d+/)?.[0] || '1'),
                        topicName: item.fullTopic,
                        score: item.score
                    }));

                navigate('/groups', { 
                    state: { 
                        showFailedAssessments: true,
                        failedTopics: failedTopics
                    }
                });
            }} className="bg-gradient-to-r from-purple-600 to-orange-400 hover:from-purple-700 hover:to-orange-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Study Weak Areas
            <ArrowRight className="w-5 h-5 ml-2" />
            </button>
        </div>
        </div>
    </div>
    );
};

export default AssessmentResults;