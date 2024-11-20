import React, { useState, useMemo, useEffect } from 'react';
import type { Question, QuizState } from '../types/quiz';

type QuizProps = {
  questions: Question[];
};

const initialQuizState: QuizState = {
  currentQuestionIndex: 0,
  answeredQuestions: [],
  score: 0
};

const Quiz: React.FC<QuizProps> = ({ questions: initialQuestions }) => {
  const [filters, setFilters] = useState({ tag: "", difficulty: "", category: "" });
  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [questions, setQuestions] = useState(initialQuestions);

  // Extract unique tags and categories
  const availableTags = useMemo(() => {
    const tags = new Set(questions.flatMap(q => q.tags));
    return Array.from(tags).sort();
  }, [questions]);

  const availableCategories = useMemo(() => {
    const categories = new Set(questions.map(q => q.category));
    return Array.from(categories).sort();
  }, [questions]);

  useEffect(() => {
    const savedState = sessionStorage.getItem('quizState');
    if (savedState) {
      setQuizState(JSON.parse(savedState));
    }
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => 
      (!filters.tag || q.tags.includes(filters.tag)) &&
      (!filters.difficulty || q.difficulty === filters.difficulty) &&
      (!filters.category || q.category === filters.category)
    );
  }, [questions, filters]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('quizState', JSON.stringify(quizState));
    }
  }, [quizState]);

  const currentQuestion = filteredQuestions[quizState.currentQuestionIndex];

  const handleAnswer = (selected: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;
    
    setSelectedAnswer(selected);
    setShowExplanation(true);
    
    const isCorrect = currentQuestion.answer === selected;
    
    setQuizState(prev => ({
      ...prev,
      answeredQuestions: [
        ...prev.answeredQuestions,
        { questionId: currentQuestion.id, wasCorrect: isCorrect }
      ],
      score: isCorrect ? prev.score + 1 : prev.score
    }));
  };

  const handlePreviousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
      // Restore the previous answer state
      const prevAnswer = quizState.answeredQuestions[quizState.currentQuestionIndex - 1];
      if (prevAnswer) {
        setSelectedAnswer(null);
        setShowExplanation(true);
      }
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = quizState.currentQuestionIndex + 1;
    if (nextIndex < filteredQuestions.length) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex
      }));
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('quizState');
    }
    setQuizState(initialQuizState);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsFinished(false);
  };

  const shuffleQuestions = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    resetQuiz();
  };

  const renderControls = () => (
    <div className="quiz-controls">
      <button 
        onClick={handlePreviousQuestion}
        disabled={quizState.currentQuestionIndex === 0}
        className="control-button"
      >
        Previous
      </button>
      
      <div className="control-center">
        <button onClick={shuffleQuestions} className="control-button">
          Shuffle Questions
        </button>
        <button onClick={resetQuiz} className="control-button">
          Restart Quiz
        </button>
      </div>

      {showExplanation && (
        <button 
          onClick={handleNextQuestion}
          disabled={quizState.currentQuestionIndex === filteredQuestions.length - 1}
          className="control-button"
        >
          Next
        </button>
      )}
    </div>
  );

  const renderExplanation = () => {
    if (!showExplanation || !currentQuestion) return null;
    
    return (
      <div className="explanation">
        <p>{currentQuestion.explanation.text}</p>
        {currentQuestion.explanation.url && (
          <a 
            href={currentQuestion.explanation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="learn-more"
          >
            {currentQuestion.explanation.urlText || 'Learn more'}
          </a>
        )}
        {currentQuestion.explanation.codeExample && (
          <pre className="code-example">
            <code className={currentQuestion.explanation.codeExample.language}>
              {currentQuestion.explanation.codeExample.code}
            </code>
          </pre>
        )}
      </div>
    );
  };

  if (isFinished) {
    return (
      <div className="quiz-result">
        <h2>Quiz Complete!</h2>
        <p>Your score: {quizState.score}/{filteredQuestions.length}</p>
        <div className="stats">
          <p>Questions answered: {quizState.answeredQuestions.length}</p>
          <p>Correct answers: {quizState.score}</p>
          <p>Success rate: {((quizState.score / filteredQuestions.length) * 100).toFixed(1)}%</p>
        </div>
        <div className="quiz-controls">
          <button onClick={resetQuiz} className="control-button">Try Again</button>
          <button onClick={shuffleQuestions} className="control-button">Try Shuffled</button>
        </div>
      </div>
    );
  }

  // Early return if no current question is available
  if (!currentQuestion) {
    return (
      <div className="quiz-container">
        <p>No questions available with the current filters.</p>
        <button onClick={resetQuiz} className="control-button">Reset Filters</button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="filters">
        <label>
          Filter by Tag:
          <select
            value={filters.tag}
            onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
          >
            <option value="">All Tags</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </label>
        <label>
          Filter by Category:
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">All Categories</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          Filter by Difficulty:
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
          >
            <option value="">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
      </div>

      <div className="question-container">
        <div className="quiz-header">
          <h2>Question {quizState.currentQuestionIndex + 1}/{filteredQuestions.length}</h2>
          <span className="score">Score: {quizState.score}</span>
        </div>
        
        {renderControls()}
        
        <p className="question-text">{currentQuestion.question}</p>
        
        {currentQuestion.image && (
          <img
            src={currentQuestion.image}
            alt="Question illustration"
            className="question-image"
          />
        )}
        
        <div className="options">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = showExplanation && currentQuestion.answer === index;
            const isWrong = showExplanation && isSelected && !isCorrect;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`option-button ${
                  isSelected ? 'selected' : ''
                } ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {renderExplanation()}
      </div>
    </div>
  );
};

export default Quiz;