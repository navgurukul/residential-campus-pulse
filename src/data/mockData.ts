import { Evaluation } from '../types';

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