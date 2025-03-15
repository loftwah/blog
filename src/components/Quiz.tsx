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
    <div className="controls flex items-center justify-between mb-8">
      <div className="difficulty-filter">
        <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Difficulty:
        </label>
        <select
          id="difficulty-filter"
          value={filters.difficulty}
          onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
        >
          <option value="">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="category-filter ml-4">
        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category:
        </label>
        <select
          id="category-filter"
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
        >
          <option value="">All</option>
          {availableCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="tag-filter ml-4">
        <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Topic:
        </label>
        <select 
          id="tag-filter"
          value={filters.tag}
          onChange={(e) => setFilters({...filters, tag: e.target.value})}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
        >
          <option value="">All</option>
          {availableTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      <button 
        onClick={shuffleQuestions}
        className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 mt-5"
      >
        Shuffle
      </button>
    </div>
  );

  const renderExplanation = () => {
    const question = filteredQuestions[quizState.currentQuestionIndex];
    if (!question || !question.explanation || !showExplanation) return null;
    
    return (
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Explanation:</h4>
        <p className="text-blue-700 dark:text-blue-300">{question.explanation}</p>
      </div>
    );
  };

  if (filteredQuestions.length === 0) {
    return (
      <div className="quiz-container p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {renderControls()}
        <div className="text-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No questions found with the selected filters.</p>
          <button 
            onClick={() => setFilters({ tag: "", difficulty: "", category: "" })}
            className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Clear Filters
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const totalQuestions = quizState.answeredQuestions.length;
    const score = quizState.score;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <div className="quiz-container p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {renderControls()}
        <div className="text-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Quiz Complete!</h2>
          <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">
            You scored <span className="font-bold text-accent">{score}</span> out of <span className="font-bold">{totalQuestions}</span> ({percentage}%)
          </p>
          <button 
            onClick={resetQuiz}
            className="inline-flex justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Take Again
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = filteredQuestions[quizState.currentQuestionIndex];
  
  return (
    <div className="quiz-container p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {renderControls()}
      
      <div className="progress-bar mb-6 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-accent h-2.5 rounded-full"
          style={{ width: `${((quizState.currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
        ></div>
      </div>
      
      <div className="question-header flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Question {quizState.currentQuestionIndex + 1} of {filteredQuestions.length}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          currentQuestion.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
          currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
          'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        }`}>
          {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
        </span>
      </div>
      
      <div className="question mb-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{currentQuestion.question}</h3>
        
        <div className="options space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedAnswer === index && showExplanation && index === currentQuestion.correctAnswer
                  ? 'bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-600 text-green-800 dark:text-green-200'
                : selectedAnswer === index && showExplanation
                  ? 'bg-red-100 dark:bg-red-900 border-red-500 dark:border-red-600 text-red-800 dark:text-red-200'
                : selectedAnswer === index
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-600 text-blue-800 dark:text-blue-200'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {renderExplanation()}
      
      <div className="navigation flex justify-between mt-6">
        <button
          onClick={handlePreviousQuestion}
          disabled={quizState.currentQuestionIndex === 0}
          className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
            quizState.currentQuestionIndex === 0
              ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent'
          }`}
        >
          Previous
        </button>
        
        {showExplanation ? (
          <button
            onClick={handleNextQuestion}
            className="inline-flex justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            {quizState.currentQuestionIndex === filteredQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        ) : (
          <button
            disabled={selectedAnswer === null}
            onClick={() => setShowExplanation(true)}
            className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              selectedAnswer === null
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent-dark focus:ring-accent'
            }`}
          >
            Check Answer
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;