import { Evaluation } from '../types';

export const competencyCategories = [
  'Vipassana',
  'Nutrition Supplementation + Yoga/Weight Training',
  'Houses and Reward Systems',
  'Etiocracy, Co-Creation & Ownership',
  'Campus interactions',
  'Gratitude',
  'Hackathons',
  'English Communication & Comprehension',
  'Learning Environment & Peer Support',
  'Process Principles Understanding & Implementation',
  'Life Skills Implementation'
];

// Generate comprehensive mock evaluations for multiple campuses
const generateEvaluationsForCampus = (campusId: string, campusName: string, baseScore: number): Evaluation[] => {
  const resolvers = [
    'Suraj Sahani',
    'Mubin',
    'Vinit Gore',
    'Priyanka',
    'Bilqees',
    'Vikas Patel'
  ];

  return resolvers.map((resolverName, index) => ({
    id: `${campusId}-${index + 1}`,
    campusId,
    resolverId: `resolver-${campusId}-${index + 1}`,
    resolverName,
    campusName,
    overallScore: Math.round((baseScore + (Math.random() - 0.5) * 2) * 10) / 10,
    competencies: competencyCategories.map(category => ({
      category,
      score: Math.round((baseScore + (Math.random() - 0.5) * 3) * 10) / 10,
      maxScore: 10
    })),
    feedback: `Comprehensive evaluation of ${campusName}. ${resolverName} provided detailed insights on various competency areas including ${competencyCategories.slice(0, 3).join(', ')} and others.`,
    dateEvaluated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Completed' as const
  }));
};

export const mockEvaluations: Evaluation[] = [
  // Generate evaluations for common campus patterns
  ...generateEvaluationsForCampus('1', 'Pune Campus', 8.5),
  ...generateEvaluationsForCampus('2', 'Dantewada Campus', 7.8),
  ...generateEvaluationsForCampus('3', 'Himachal Campus', 7.2),
  ...generateEvaluationsForCampus('4', 'Bangalore Campus', 8.1),
  ...generateEvaluationsForCampus('5', 'Delhi Campus', 7.9),
  ...generateEvaluationsForCampus('6', 'Mumbai Campus', 8.3),
  ...generateEvaluationsForCampus('7', 'Hyderabad Campus', 7.6),
  ...generateEvaluationsForCampus('8', 'Chennai Campus', 8.0),
  ...generateEvaluationsForCampus('9', 'Kolkata Campus', 7.4),
  ...generateEvaluationsForCampus('10', 'Ahmedabad Campus', 7.7),
  
  // Generate evaluations for any campus ID that might come from API
  ...Array.from({ length: 50 }, (_, i) => {
    const campusId = `campus-${i + 11}`;
    const campusName = `Campus ${i + 11}`;
    const baseScore = 6.5 + Math.random() * 2.5;
    
    return {
      id: `eval-${i + 100}`,
      campusId,
      resolverId: `resolver-${i + 100}`,
      resolverName: `Evaluator ${i + 1}`,
      campusName,
      overallScore: Math.round(baseScore * 10) / 10,
      competencies: competencyCategories.map(category => ({
        category,
        score: Math.round((baseScore + (Math.random() - 0.5) * 2) * 10) / 10,
        maxScore: 10
      })),
      feedback: `Detailed evaluation of ${campusName} covering all key competency areas with specific focus on improvement opportunities.`,
      dateEvaluated: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Completed' as const
    };
  })
];