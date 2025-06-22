import { useState } from 'react';
import { apiService } from './services/api';

interface QuizQuestion {
    question: string;
    answerOptions: {
        A: string;
        B: string;
        C: string;
    };
    correctAnswer: string;
    sourceReference: string;
}

function QuizGenerator() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [error, setError] = useState('');

    const generateQuiz = async () => {
        if (!content.trim()) {
            setError('Please enter some content to generate questions from');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await apiService.generateTopicsAndQuizzes(content);
            
            // Extract questions from the response structure
            if (data.quizzes && data.quizzes.length > 0) {
                const allQuestions = data.quizzes.flatMap((quiz: any) => quiz.questions || []);
                setQuestions(allQuestions);
            } else {
                setError('No questions were generated. Please try with different content.');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="quiz-generator">
            <h2>AI Quiz Generator</h2>
            <div className="content-input">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter some text to generate quiz questions from..."
                    rows={6}
                    className="content-textarea"
                />
            </div>

            <button
                onClick={generateQuiz}
                disabled={loading}
                className="generate-button"
            >
                {loading ? 'Generating...' : 'Generate Quiz Questions'}
            </button>

            {error && <p className="error">{error}</p>}

            {questions.length > 0 && (
                <div className="quiz-questions">
                    <h3>Generated Questions:</h3>
                    {questions.map((q, index) => (
                        <div key={index} className="question-card">
                            <h4>Question {index + 1}</h4>
                            <p>{q.question}</p>

                            <div className="answer-options">
                                <p>A: {q.answerOptions.A}</p>
                                <p>B: {q.answerOptions.B}</p>
                                <p>C: {q.answerOptions.C}</p>
                                <p><strong>Correct Answer: {q.correctAnswer}</strong></p>
                            </div>

                            <div className="source">
                                <small>Source: {q.sourceReference}</small>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default QuizGenerator;