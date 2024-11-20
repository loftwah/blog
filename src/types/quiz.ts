export interface QuizExplanation {
  text: string;
  url?: string;
  urlText?: string;
  codeExample?: {
    code: string;
    language: string;
  };
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: number;
  image?: string;
  explanation: QuizExplanation;
  tags: string[];
  difficulty: string;  // Changed from union type to string to match JSON data
  category: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  answeredQuestions: {
    questionId: string;
    wasCorrect: boolean;
  }[];
  score: number;
}