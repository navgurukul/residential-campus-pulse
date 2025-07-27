import { Campus, Resolver, Evaluation } from '../types';

export const mockCampuses: Campus[] = [
  {
    id: '1',
    name: 'Pune Campus',
    location: 'Pune',
    averageScore: 8.5,
    totalResolvers: 10,
    ranking: 'High',
    lastEvaluated: '2024-01-15'
  },
  {
    id: '2',
    name: 'Dantewada Campus',
    location: 'Dantewada',
    averageScore: 7.8,
    totalResolvers: 9,
    ranking: 'High',
    lastEvaluated: '2024-01-14'
  },
  {
    id: '3',
    name: 'Himachal Campus',
    location: 'Himachal',
    averageScore: 7.2,
    totalResolvers: 10,
    ranking: 'Medium',
    lastEvaluated: '2024-01-13'
  },
  {
    id: '4',
    name: 'Raipur Campus',
    location: 'Raipur',
    averageScore: 6.9,
    totalResolvers: 9,
    ranking: 'Medium',
    lastEvaluated: '2024-01-12'
  },
  {
    id: '5',
    name: 'Kishanganj Campus',
    location: 'Kishanganj',
    averageScore: 6.5,
    totalResolvers: 10,
    ranking: 'Medium',
    lastEvaluated: '2024-01-11'
  },
  {
    id: '6',
    name: 'Udaipur Campus',
    location: 'Udaipur',
    averageScore: 6.1,
    totalResolvers: 9,
    ranking: 'Low',
    lastEvaluated: '2024-01-10'
  },
  {
    id: '7',
    name: 'Sarjapur Campus',
    location: 'Sarjapur',
    averageScore: 5.8,
    totalResolvers: 10,
    ranking: 'Low',
    lastEvaluated: '2024-01-09'
  },
  {
    id: '8',
    name: 'Dharamshala Campus',
    location: 'Dharamshala',
    averageScore: 5.4,
    totalResolvers: 9,
    ranking: 'Low',
    lastEvaluated: '2024-01-08'
  }
];

export const mockResolvers: Resolver[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@edu.com',
    campusesEvaluated: 9,
    averageScoreGiven: 7.2,
    totalEvaluations: 9,
    lastActivity: '2024-01-15'
  },
  {
    id: '2',
    name: 'Prof. Michael Chen',
    email: 'michael.chen@edu.com',
    campusesEvaluated: 8,
    averageScoreGiven: 6.8,
    totalEvaluations: 8,
    lastActivity: '2024-01-14'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@edu.com',
    campusesEvaluated: 9,
    averageScoreGiven: 7.5,
    totalEvaluations: 9,
    lastActivity: '2024-01-13'
  },
  {
    id: '4',
    name: 'Prof. David Wilson',
    email: 'david.wilson@edu.com',
    campusesEvaluated: 7,
    averageScoreGiven: 6.4,
    totalEvaluations: 7,
    lastActivity: '2024-01-12'
  },
  {
    id: '5',
    name: 'Dr. Lisa Thompson',
    email: 'lisa.thompson@edu.com',
    campusesEvaluated: 9,
    averageScoreGiven: 7.8,
    totalEvaluations: 9,
    lastActivity: '2024-01-11'
  }
];

export const mockEvaluations: Evaluation[] = [
  {
    id: '1',
    campusId: '1',
    resolverId: '1',
    resolverName: 'Dr. Sarah Johnson',
    campusName: 'Pune Campus',
    overallScore: 8.5,
    competencies: [
      { category: 'Infrastructure', score: 9, maxScore: 10 },
      { category: 'Faculty Quality', score: 8, maxScore: 10 },
      { category: 'Curriculum', score: 8, maxScore: 10 },
      { category: 'Student Services', score: 9, maxScore: 10 },
      { category: 'Technology', score: 8, maxScore: 10 }
    ],
    feedback: 'Excellent infrastructure and strong faculty. Technology integration could be improved.',
    dateEvaluated: '2024-01-15',
    status: 'Completed'
  },
  {
    id: '2',
    campusId: '2',
    resolverId: '2',
    resolverName: 'Prof. Michael Chen',
    campusName: 'Dantewada Campus',
    overallScore: 7.8,
    competencies: [
      { category: 'Infrastructure', score: 8, maxScore: 10 },
      { category: 'Faculty Quality', score: 8, maxScore: 10 },
      { category: 'Curriculum', score: 7, maxScore: 10 },
      { category: 'Student Services', score: 8, maxScore: 10 },
      { category: 'Technology', score: 8, maxScore: 10 }
    ],
    feedback: 'Good overall performance with room for curriculum enhancement.',
    dateEvaluated: '2024-01-14',
    status: 'Completed'
  },
  {
    id: '3',
    campusId: '3',
    resolverId: '3',
    resolverName: 'Dr. Emily Rodriguez',
    campusName: 'Himachal Campus',
    overallScore: 7.2,
    competencies: [
      { category: 'Infrastructure', score: 7, maxScore: 10 },
      { category: 'Faculty Quality', score: 7, maxScore: 10 },
      { category: 'Curriculum', score: 7, maxScore: 10 },
      { category: 'Student Services', score: 8, maxScore: 10 },
      { category: 'Technology', score: 7, maxScore: 10 }
    ],
    feedback: 'Solid performance across all areas. Infrastructure needs attention.',
    dateEvaluated: '2024-01-13',
    status: 'Completed'
  }
];

export const competencyCategories = [
  'Infrastructure',
  'Faculty Quality',
  'Curriculum',
  'Student Services',
  'Technology',
  'Research Facilities',
  'Student Support',
  'Administration'
];