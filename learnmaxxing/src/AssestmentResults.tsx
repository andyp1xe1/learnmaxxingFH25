
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Trophy, Target, BookOpen, ArrowRight} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
function AssessmentResults(){
    const navigate = useNavigate();
    const quizResults = 
        [
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
                    "paragraph": "A closure gives you access to an outer function’s scope from an inner function."
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
            ]


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
                    {item.references && item.references.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                            Study References
                        </h4>
                        <div className="space-y-1">
                            {item.references.map((ref, refIndex) => (
                            <div key={refIndex} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                <span className="font-medium">Q{ref.questionId}:</span> {ref.referenceTitle}
                            </div>
                            ))}
                        </div>
                        </div>
                    )}
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
            <button onClick={() => navigate('/modeselection')} className="bg-gradient-to-r from-purple-600 to-orange-400 hover:from-purple-700 hover:to-orange-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center">
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