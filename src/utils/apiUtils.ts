// src/utils/apiUtils.ts
import { Campus, Resolver, Evaluation } from '../types';
import { mockEvaluations } from '../data/mockData';
import { LocalStorageManager } from './localStorage';

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

// Campus name mapping to handle name changes and additions
const campusNameMapping: { [key: string]: string } = {
  'Raipur': 'Raigarh',
  'raipur': 'Raigarh',
  // Add other mappings as needed
};

// Additional campuses to include
const additionalCampuses = ['Dharamshala', 'Raigarh'];

export const processApiData = (apiData: ApiResponse): { campuses: Campus[], resolvers: Resolver[], evaluations: Evaluation[] } => {
  if (!apiData || !apiData.responses) {
    return { campuses: [], resolvers: [], evaluations: [] };
  }

  const validResponses = apiData.responses.filter(r => r.name && r.timestamp && r.campus);

  const resolverMap = new Map<string, any>();
  const campusMap = new Map<string, any>();

  validResponses.forEach((response, index) => {
    const { name, email, timestamp, level, framework } = response;
    // Apply campus name mapping
    const campus = campusNameMapping[response.campus] || response.campus;

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

  // Add additional campuses that might not be in the API data
  additionalCampuses.forEach((campusName, index) => {
    if (!campusMap.has(campusName)) {
      campusMap.set(campusName, {
        id: `additional-${campusName}-${index}`,
        name: `${campusName} Campus`,
        location: campusName,
        lastEvaluated: new Date().toISOString().split('T')[0],
        resolvers: new Set<string>(),
        averageScore: getRandomScore(),
      });
    }
  });

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

// Enhanced API function with local storage integration
// PERFORMANCE: Add request deduplication to prevent redundant API calls
let pendingRequest: Promise<{ campuses: Campus[], resolvers: Resolver[], evaluations: Evaluation[] }> | null = null;

export const fetchCampusData = async (): Promise<{ campuses: Campus[], resolvers: Resolver[], evaluations: Evaluation[] }> => {
  // PERFORMANCE: If there's already a pending request, return it instead of making a new one
  if (pendingRequest) {
    console.log('🔄 Reusing pending request...');
    return pendingRequest;
  }

  // Create the request promise
  pendingRequest = (async () => {
    try {
      // First, try to get cached data
      const cachedData = LocalStorageManager.getCachedCampusData();
      if (cachedData) {
        console.log('📦 Using cached data, age:', LocalStorageManager.getCacheAgeMinutes(), 'minutes');
        return cachedData;
      }

      console.log('🌐 Fetching fresh data from API...');
      
      // PERFORMANCE: Add abort controller with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        // Try to fetch from the backend API
        const response = await fetch('https://ng-campus-pulse.onrender.com/api/campus-data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const apiData = await response.json();
        
        // Check if we got the new format from /api/campus-data
        if (apiData.campuses && apiData.resolvers && apiData.evaluations) {
          console.log('✅ Received processed data from backend');
          
          // Save to localStorage
          LocalStorageManager.saveCampusData(
            apiData.campuses, 
            apiData.resolvers, 
            apiData.evaluations
          );
          
          return {
            campuses: apiData.campuses,
            resolvers: apiData.resolvers,
            evaluations: apiData.evaluations
          };
        }
        
        // Fallback to old processing if needed
        const processedData = processApiData(apiData);
        
        // Save to localStorage
        LocalStorageManager.saveCampusData(
          processedData.campuses, 
          processedData.resolvers, 
          processedData.evaluations
        );
        
        console.log('✅ Fresh data fetched and cached');
        return processedData;
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error('❌ API request timeout');
        } else {
          console.error('❌ API fetch failed:', fetchError);
        }
        
        // Try to use expired cache as fallback
        const expiredCache = localStorage.getItem('campus_pulse_data');
        if (expiredCache) {
          try {
            const cachedData = JSON.parse(expiredCache);
            console.log('📦 Using expired cache as fallback');
            return {
              campuses: cachedData.campuses || [],
              resolvers: cachedData.resolvers || [],
              evaluations: cachedData.evaluations || []
            };
          } catch (parseError) {
            console.error('❌ Failed to parse expired cache:', parseError);
          }
        }
        
        // Last resort: return empty data
        console.log('⚠️ No data available, returning empty datasets');
        return { campuses: [], resolvers: [], evaluations: [] };
      }
    } finally {
      // Clear the pending request after it completes (success or failure)
      pendingRequest = null;
    }
  })();

  return pendingRequest;
};

// Function to force refresh data
export const refreshCampusData = async (): Promise<{ campuses: Campus[], resolvers: Resolver[], evaluations: Evaluation[] }> => {
  console.log('🔄 Force refreshing campus data...');
  LocalStorageManager.clearCampusData();
  return await fetchCampusData();
};

// Function to check if we should fetch fresh data
export const shouldFetchFreshData = (): boolean => {
  return !LocalStorageManager.isCacheValid();
};

// Function to get cache status
export const getCacheStatus = () => {
  const storageInfo = LocalStorageManager.getStorageInfo();
  const lastSync = LocalStorageManager.getLastSyncTime();
  
  return {
    isValid: storageInfo.isValid,
    ageMinutes: LocalStorageManager.getCacheAgeMinutes(),
    lastSync: lastSync?.toLocaleString(),
    sizeKB: Math.round(storageInfo.totalSize / 1024),
    isOffline: LocalStorageManager.isOfflineMode()
  };
};