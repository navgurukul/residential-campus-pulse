export interface Campus {
  id: string;
  name: string;
  location: string;
  averageScore: number;
  totalResolvers: number;
  ranking: 'High' | 'Medium' | 'Low';
  lastEvaluated: string;
}

export interface Resolver {
  id: string;
  name: string;
  email: string;
  campusesEvaluated: number;
  averageScoreGiven: number;
  totalEvaluations: number;
  lastActivity: string;
}

export interface Competency {
  category: string;
  score: number;
  maxScore: number;
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
}