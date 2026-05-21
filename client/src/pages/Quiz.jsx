import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

function Quiz() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [isStarting, setIsStarting] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ADD THIS

  useEffect(() => {
    startQuiz();
  }, [categoryId]);

  const startQuiz = async () => {
    if (isStarting) return;
    
    setIsStarting(true);
    try {
      setLoading(true);
      setError('');
      const res = await API.get(`/Quiz/generate/${categoryId}`);
      
      if (res.data.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        setSessionId(res.data.sessionId);
      } else {
        setError('No questions available for this category. Try another category.');
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load quiz. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
      setIsStarting(false);
    }
  };

  const handleAnswer = (answer) => {
    if (answerSubmitted) return;
    
    setSelectedAnswer(answer);
    const currentQ = questions[currentIndex];
    const correct = answer === currentQ.correctAnswer;
    setIsCorrect(correct);
    setAnswerSubmitted(true);
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    setAnswers(prev => [...prev, {  // Changed to functional update
      question: currentQ.question,
      userAnswer: answer,
      correctAnswer: currentQ.correctAnswer,
      timeToAnswer: timeTaken
    }]);
  };

  const goToNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer('');
      setAnswerSubmitted(false);
      setStartTime(Date.now());
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
  
    const finalAnswers = answers;
    
    let score = 0;
    finalAnswers.forEach(ans => {
        if (ans.userAnswer === ans.correctAnswer) score += 10;
    });
    
    try {
        const response = await API.post('/Quiz/submit', {
            sessionId,
            score,
            totalQuestions: questions.length,
            answers: finalAnswers
        });
        
        console.log('Submit response:', response.data);
        
        navigate(`/results/${sessionId}`, { state: { score, total: questions.length } });
    } catch (err) {
        console.error('Failed to submit quiz:', err);
        navigate('/dashboard');
    } finally {
        setIsSubmitting(false);
    }
};

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <div className="loading-spinner">Loading questions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <p>No questions available. Please try a different category.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const getOptionClass = (opt) => {
    if (!answerSubmitted) {
      return selectedAnswer === opt ? 'option selected' : 'option';
    }
    
    if (opt === currentQ.correctAnswer) {
      return 'option correct-highlight';
    }
    
    if (opt === selectedAnswer && opt !== currentQ.correctAnswer) {
      return 'option wrong-highlight';
    }
    
    return 'option disabled-option';
  };

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        {answerSubmitted && (
          <span className={isCorrect ? 'feedback-correct' : 'feedback-wrong'}>
            {isCorrect ? '✓ Correct!' : '✗ Wrong!'}
          </span>
        )}
      </div>
      
      <div className="quiz-card">
        <div className="quiz-question">
          {currentQ.question}
        </div>
        
        <div className="options">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(opt)}
              className={getOptionClass(opt)}
              disabled={answerSubmitted}
            >
              {String.fromCharCode(65 + idx)}. {opt}
            </button>
          ))}
        </div>
        
        {!answerSubmitted && (
          <p className="quiz-hint">Click on an answer to select it</p>
        )}
        
        {answerSubmitted && (
          <button onClick={goToNextQuestion} className="btn-next">
            {currentIndex + 1 === questions.length ? 'Finish Quiz' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}

export default Quiz;