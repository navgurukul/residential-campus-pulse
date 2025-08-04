// src/utils/apiUtils.ts
import { Campus, Resolver, Evaluation } from '../types';
import { mockEvaluations } from '../data/mockData';

interface ApiResponse {
  status: string;
  responses: {
    name: string;
    email: string;
    timestamp: string;
    campus: string;
    level: string;
    framework: string;
  }[];
}

// Helper for random score
const getRandomScore = () => Math.random() * 4 + 5; // 5.0 to 9.0

// Helper for ranking
const getRanking = (score: number): 'High' | 'Medium' | 'Low' => {
  if (score >= 8) return 'High';
  if (score >= 6.5) return 'Medium';
  return 'Low';
};

export const processApiData = (apiData: ApiResponse): { campuses: Campus[], resolvers: Resolver[], evaluations: Evaluation[] } => {
  if (!apiData || !apiData.responses) {
    return { campuses: [], resolvers: [], evaluations: [] };
  }

  const validResponses = apiData.responses.filter(r => r.name && r.timestamp && r.campus);

  const resolverMap = new Map<string, any>();
  const campusMap = new Map<string, any>();

  validResponses.forEach((response, index) => {
    const { name, email, timestamp, campus, level, framework } = response;

    // Process resolvers
    if (!resolverMap.has(name)) {
      resolverMap.set(name, {
        id: `${name}-${index}`, // simple unique id
        name,
        email: email || 'N/A',
        totalEvaluations: 0,
        lastActivity: '1970-01-01T00:00:00.000Z',
        campuses: new Set<string>(),
        averageScoreGiven: getRandomScore(),
        level,
        framework,
      });
    }
    const resolver = resolverMap.get(name);
    resolver.totalEvaluations += 1;
    if (new Date(timestamp) > new Date(resolver.lastActivity)) {
      resolver.lastActivity = timestamp;
    }
    resolver.campuses.add(campus);

    // Process campuses
    if (!campusMap.has(campus)) {
      campusMap.set(campus, {
        id: `${campus}-${index}`, // simple unique id
        name: `${campus} Campus`,
        location: campus,
        lastEvaluated: '1970-01-01T00:00:00.000Z',
        resolvers: new Set<string>(),
        averageScore: getRandomScore(),
      });
    }
    const campusEntry = campusMap.get(campus);
    if (new Date(timestamp) > new Date(campusEntry.lastEvaluated)) {
      campusEntry.lastEvaluated = timestamp;
    }
    campusEntry.resolvers.add(name);
  });

  const resolvers: Resolver[] = Array.from(resolverMap.values()).map(r => ({
    ...r,
    campusesEvaluated: r.campuses.size,
  }));

  const campuses: Campus[] = Array.from(campusMap.values()).map(c => ({
    ...c,
    totalResolvers: c.resolvers.size,
    ranking: getRanking(c.averageScore),
  }));

  const campusNameToIdMap = new Map(campuses.map(c => [c.name, c.id]));

  const evaluations: Evaluation[] = mockEvaluations.map(e => ({
    ...e,
    campusId: campusNameToIdMap.get(e.campusName) || e.campusId,
  }));

  return { campuses, resolvers, evaluations };
};
