export interface Article {
  id: number;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  isViolation: boolean;
  violationType: string;
  expectedAction: 'pass' | 'revise' | 'report';
  fallacies: string[];
  facts: {
    text: string;
    sourceStatus: 'unreliable' | 'incomplete' | 'missing' | 'misquoted' | 'normal';
  }[];
  originalContext?: {
    quote: string;
    fullText: string;
  };
  difficulty: number;
}

export interface GameProgress {
  currentDay: number;
  currentIndex: number;
  completedCount: number;
  dailyScore: number;
  todayRecords: Record[];
  settings: {
    muted: boolean;
  };
}

export interface Record {
  articleId: number;
  userAction: 'pass' | 'revise' | 'report';
  isCorrect: boolean;
  scoreChange: number;
  selectedFlaws: string[];
}

export interface GameState {
  currentDay: number;
  currentIndex: number;
  completedCount: number;
  dailyScore: number;
  totalSalary: number;
  todayRecords: Record[];
  selectedFlaws: string[];
  currentArticle: Article | null;
  articles: Article[];
  settings: {
    muted: boolean;
  };
  showSpecialEvent: boolean;
  specialEventData: {
    title: string;
    content: string;
  } | null;
  departmentPenaltyOrBonus: { type: 'penalty' | 'bonus'; amount: number } | null;
}