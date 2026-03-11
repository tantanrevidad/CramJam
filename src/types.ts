export type QuestionFormat = 
  | 'Multiple Choice' 
  | 'Matching Type' 
  | 'Modified True or False' 
  | 'Fill in the Blanks' 
  | 'Identification' 
  | 'Enumeration';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type DiagramQuizType = 'Explain the process' | 'Fill in the blanks' | 'None';

export interface QuizConfig {
  format: QuestionFormat[];
  difficulty: Difficulty;
  count: number;
  focusArea: string; // Empty string means entire material
  timeLimit: number; // In seconds. 0 means no limit
  diagramQuizType: DiagramQuizType;
}

export interface Question {
  id: string;
  chapter: string;
  format: QuestionFormat;
  questionVariations: string[]; // 3 variations to avoid rote memorization
  options?: string[]; // Used for Multiple Choice
  correctAnswer: string;
  explanation: string;
}

export interface GradingResult {
  isCorrect: boolean;
  score: number; // 0 to 1
  feedback: string;
}

export interface UserAnswer {
  question: Question;
  userAnswer: string;
  grading: GradingResult;
  timeSpent: number;
}

export interface QuizAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface Deck {
  id: string;
  title: string;
  createdAt: number;
  questions: Question[];
}
