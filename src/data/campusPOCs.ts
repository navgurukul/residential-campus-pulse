// Campus Point of Contact (POC) Configuration
// Maps competencies to responsible persons for each campus

export interface CompetencyPOC {
  name: string;
  competencies: string[];
}

export interface CampusPOCConfig {
  campus: string;
  pocs: CompetencyPOC[];
}

export const CAMPUS_POC_DATA: CampusPOCConfig[] = [
  {
    campus: 'Pune',
    pocs: [
      {
        name: 'Divya Sonla',
        competencies: [
          'Learning Environment & Peer Support',
          'Hackathons'
        ]
      },
      {
        name: 'Sayna Singh',
        competencies: [
          'Etiocracy, Co-Creation & Ownership',
          'Houses and Reward Systems',
          'Life Skills Implementation'
        ]
      },
      {
        name: 'Muktai Indraksha',
        competencies: [
          'Gratitude',
          'Campus interactions'
        ]
      },
      {
        name: 'Bushra Khatun',
        competencies: [
          'Vipassana',
          'Meditation (Ana Pana for most and students attending Vipassana Camps)',
          'Process Principles Understanding & Implementation'
        ]
      }
    ]
  }
  // Add more campuses here as needed
  // {
  //   campus: 'Bangalore',
  //   pocs: [...]
  // }
];

/**
 * Get POC for a specific campus and competency
 */
export function getPOCForCompetency(campusName: string, competencyName: string): string | null {
  const campusConfig = CAMPUS_POC_DATA.find(
    config => config.campus.toLowerCase() === campusName.toLowerCase()
  );

  if (!campusConfig) return null;

  for (const poc of campusConfig.pocs) {
    // Check for exact match or partial match
    const hasCompetency = poc.competencies.some(comp => 
      comp.toLowerCase().includes(competencyName.toLowerCase()) ||
      competencyName.toLowerCase().includes(comp.toLowerCase())
    );

    if (hasCompetency) {
      return poc.name;
    }
  }

  return null;
}

/**
 * Get all POCs for a campus
 */
export function getCampusPOCs(campusName: string): CompetencyPOC[] {
  const campusConfig = CAMPUS_POC_DATA.find(
    config => config.campus.toLowerCase() === campusName.toLowerCase()
  );

  return campusConfig?.pocs || [];
}

/**
 * Get competencies managed by a specific POC
 */
export function getPOCCompetencies(campusName: string, pocName: string): string[] {
  const campusConfig = CAMPUS_POC_DATA.find(
    config => config.campus.toLowerCase() === campusName.toLowerCase()
  );

  if (!campusConfig) return [];

  const poc = campusConfig.pocs.find(
    p => p.name.toLowerCase() === pocName.toLowerCase()
  );

  return poc?.competencies || [];
}

/**
 * Check if a campus has POC configuration
 */
export function hasPOCConfig(campusName: string): boolean {
  return CAMPUS_POC_DATA.some(
    config => config.campus.toLowerCase() === campusName.toLowerCase()
  );
}
