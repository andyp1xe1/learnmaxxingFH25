import { useState } from 'react';

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
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }
      
      setQuestions(data);
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
                <p className={q.correctAnswer === 'A' ? 'correct-answer' : ''}>
                  A: {q.answerOptions.A}
                </p>
                <p className={q.correctAnswer === 'B' ? 'correct-answer' : ''}>
                  B: {q.answerOptions.B}
                </p>
                <p className={q.correctAnswer === 'C' ? 'correct-answer' : ''}>
                  C: {q.answerOptions.C}
                </p>
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