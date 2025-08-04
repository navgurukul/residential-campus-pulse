// src/utils/apiUtils.ts
import { Campus, Resolver } from '../types';

interface ApiResponse {
  status: string;
  responses: {
    name: string;
    timestamp: string;
    campus: string;
  }[];
}

// Helper to generate a simple slug for email
const createEmailFromName = (name: string) => {
  if (!name) return 'anonymous@example.com';
  return `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
};

// Helper for random score
const getRandomScore = () => Math.random() * 4 + 5; // 5.0 to 9.0

// Helper for ranking
const getRanking = (score: number): 'High' | 'Medium' | 'Low' => {
  if (score >= 8) return 'High';
  if (score >= 6.5) return 'Medium';
  return 'Low';
};

export const processApiData = (apiData: ApiResponse): { campuses: Campus[], resolvers: Resolver[] } => {
  if (!apiData || !apiData.responses) {
    return { campuses: [], resolvers: [] };
  }

  const validResponses = apiData.responses.filter(r => r.name && r.timestamp && r.campus);

  const resolverMap = new Map<string, any>();
  const campusMap = new Map<string, any>();

  validResponses.forEach((response, index) => {
    const { name, timestamp, campus } = response;

    // Process resolvers
    if (!resolverMap.has(name)) {
      resolverMap.set(name, {
        id: `${name}-${index}`, // simple unique id
        name,
        email: createEmailFromName(name),
        totalEvaluations: 0,
        lastActivity: '1970-01-01T00:00:00.000Z',
        campuses: new Set<string>(),
        averageScoreGiven: getRandomScore(),
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

  return { campuses, resolvers };
};
