export interface Campus {
  id: string;
  name: string;
  location: string;
  averageScore: number;
  totalResolvers: number;
  ranking: 'Level 0' | 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5' | 'Level 6' | 'Level 7';
  lastEvaluated: string;
  status?: 'Active' | 'Closed' | 'Relocated';
  relocatedTo?: string;
}

export interface Resolver {
  id: string;
  name: string;
  email: string;
  campusesEvaluated: number;
  averageScoreGiven: number;
  totalEvaluations: number;
  lastActivity: string;
  level: string;
  framework: string;
}

export interface Competency {
  category: string;
  score: number;
  maxScore: number;
  level?: string; // Original level text like "Level 1", "Level 2", etc.
}

export interface Evaluation {
  id: string;
  campusId: string;
  resolverId: string;
  resolverName: string;
  campusName: string;
  overallScore: number;
  competencies: Competency[];
  feedback: string;
  competencyFeedback?: {
    [key: string]: string;
  };
  urgentCampusIssue?: string;
  escalationIssue?: string;
  dateEvaluated: string;
  status: 'Completed' | 'In Progress' | 'Pending';
}

export interface FilterState {
  campus: string;
  resolver: string;
  dateRange: {
    start: string;
    end: string;
  };
  competencyCategory: string;
  competency: string;
}