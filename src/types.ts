export type Level = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';

export type PartId = 'part1' | 'part2' | 'part3' | 'part4' | 'all';

export interface PartConfig {
  id: PartId;
  partNumber: number;
  title: string;
  englishTitle: string;
  subtitle: string;
  questionCount: number;
  timeLimitMinutes: number;
  timeLimitSeconds: number;
  maxScore: number;
  badge: string;
  color: string;
  description: string;
  levelBreakdown: {
    nhanBiet: number;
    thongHieu: number;
    vanDung: number;
  };
}

export type Category = 
  | 'Vocabulary' 
  | 'Prepositions' 
  | 'Verb forms' 
  | 'Communication' 
  | 'Sentence building' 
  | 'Reading and writing';

export type QuestionType = 
  | 'multiple-choice' 
  | 'fill-blank' 
  | 'reorder-words' 
  | 'matching' 
  | 'drag-drop' 
  | 'reorder-dialogue';

export interface MatchingPair {
  left: string;
  right: string;
  leftId: string;
  rightId: string;
}

export interface Question {
  id: number;
  partId?: PartId;
  stage: 1 | 2 | 3 | 4 | 5;
  stageName: string;
  level: Level;
  type: QuestionType;
  category: Category;
  question: string;
  subText?: string;
  badgeIcon?: string;
  // For multiple-choice
  options?: string[];
  // For multiple-choice & fill-blank
  answer: string;
  // Alternate accepted spellings/variants for fill-blank or sentence input
  acceptableAnswers?: string[];
  // For reorder-words & reorder-dialogue
  scrambledItems?: string[];
  correctOrder?: string[];
  // For matching
  matchingPairs?: MatchingPair[];
  // For drag-drop
  dragPool?: string[];
  dragTemplate?: string; // e.g. "I love ___ origami in my free time."
  
  // Pedagogical guidance
  explanation: string;
  grammarFormula?: string;
  example: string;
  tip?: string;
}

export interface StudentProfile {
  name: string;
  studentClass: string;
  school: string;
}

export interface AnswerRecord {
  questionId: number;
  isCorrect: boolean;
  userAnswer: string;
  timeSpentSeconds: number;
  usedHint: boolean;
}

export interface MistakeRecord {
  question: Question;
  userAnswer: string;
  practiceSolved?: boolean;
}
