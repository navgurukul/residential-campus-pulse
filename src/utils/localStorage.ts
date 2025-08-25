// src/utils/localStorage.ts
import { Campus, Resolver, Evaluation } from '../types';

interface CachedData {
  campuses: Campus[];
  resolvers: Resolver[];
  evaluations: Evaluation[];
  timestamp: number;
  version: string;
}

interface UrgentIssue {
  id: string;
  campusName: string;
  resolverName: string;
  content: string;
  timestamp: string;
  type: 'Urgent Campus Issue' | 'Escalation Required';
  priority: 'HIGH' | 'URGENT';
  status: 'new' | 'acknowledged' | 'resolved';
}

const STORAGE_KEYS = {
  CAMPUS_DATA: 'campus_pulse_data',
  URGENT_ISSUES: 'campus_pulse_urgent_issues',
  LAST_SYNC: 'campus_pulse_last_sync',
  USER_PREFERENCES: 'campus_pulse_preferences',
  OFFLINE_MODE: 'campus_pulse_offline_mode'
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const DATA_VERSION = '1.0.0';

export class LocalStorageManager {
  
  // Main data caching
  static saveCampusData(campuses: Campus[], resolvers: Resolver[], evaluations: Evaluation[]): void {
    try {
      const cachedData: CachedData = {
        campuses,
        resolvers,
        evaluations,
        timestamp: Date.now(),
        version: DATA_VERSION
      };
      
      localStorage.setItem(STORAGE_KEYS.CAMPUS_DATA, JSON.stringify(cachedData));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      
      console.log('✅ Campus data saved to localStorage', {
        campuses: campuses.length,
        resolvers: resolvers.length,
        evaluations: evaluations.length
      });
    } catch (error) {
      console.error('❌ Failed to save campus data to localStorage:', error);
    }
  }

  static getCachedCampusData(): { campuses: Campus[], resolvers: Resolver[], evaluations: Evaluation[] } | null {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.CAMPUS_DATA);
      if (!cached) return null;

      const cachedData: CachedData = JSON.parse(cached);
      
      // Check version compatibility
      if (cachedData.version !== DATA_VERSION) {
        console.log('🔄 Cache version mismatch, clearing old data');
        this.clearCampusData();
        return null;
      }

      // Check if cache is still valid
      const isExpired = Date.now() - cachedData.timestamp > CACHE_DURATION;
      if (isExpired) {
        console.log('⏰ Cache expired, will fetch fresh data');
        return null;
      }

      console.log('✅ Using cached campus data', {
        age: Math.round((Date.now() - cachedData.timestamp) / 1000 / 60),
        campuses: cachedData.campuses.length,
        resolvers: cachedData.resolvers.length
      });

      return {
        campuses: cachedData.campuses,
        resolvers: cachedData.resolvers,
        evaluations: cachedData.evaluations
      };
    } catch (error) {
      console.error('❌ Failed to get cached campus data:', error);
      return null;
    }
  }

  static isCacheValid(): boolean {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.CAMPUS_DATA);
      if (!cached) return false;

      const cachedData: CachedData = JSON.parse(cached);
      const isExpired = Date.now() - cachedData.timestamp > CACHE_DURATION;
      const isVersionValid = cachedData.version === DATA_VERSION;
      
      return !isExpired && isVersionValid;
    } catch {
      return false;
    }
  }

  // Urgent issues management
  static saveUrgentIssues(issues: UrgentIssue[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.URGENT_ISSUES, JSON.stringify({
        issues,
        timestamp: Date.now()
      }));
      console.log('✅ Urgent issues saved to localStorage:', issues.length);
    } catch (error) {
      console.error('❌ Failed to save urgent issues:', error);
    }
  }

  static getUrgentIssues(): UrgentIssue[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.URGENT_ISSUES);
      if (!cached) return [];

      const data = JSON.parse(cached);
      return data.issues || [];
    } catch (error) {
      console.error('❌ Failed to get urgent issues:', error);
      return [];
    }
  }

  static addUrgentIssue(issue: Omit<UrgentIssue, 'id'>): void {
    const issues = this.getUrgentIssues();
    const newIssue: UrgentIssue = {
      ...issue,
      id: `urgent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    issues.unshift(newIssue); // Add to beginning
    this.saveUrgentIssues(issues);
  }

  static updateUrgentIssueStatus(issueId: string, status: UrgentIssue['status']): void {
    const issues = this.getUrgentIssues();
    const issueIndex = issues.findIndex(issue => issue.id === issueId);
    
    if (issueIndex !== -1) {
      issues[issueIndex].status = status;
      this.saveUrgentIssues(issues);
    }
  }

  // User preferences
  static saveUserPreferences(preferences: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('❌ Failed to save user preferences:', error);
    }
  }

  static getUserPreferences(): any {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error('❌ Failed to get user preferences:', error);
      return {};
    }
  }

  // Offline mode management
  static setOfflineMode(isOffline: boolean): void {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, JSON.stringify(isOffline));
  }

  static isOfflineMode(): boolean {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
      return cached ? JSON.parse(cached) : false;
    } catch {
      return false;
    }
  }

  // Sync status
  static getLastSyncTime(): Date | null {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return cached ? new Date(cached) : null;
    } catch {
      return null;
    }
  }

  static getCacheAge(): number {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.CAMPUS_DATA);
      if (!cached) return 0;

      const cachedData: CachedData = JSON.parse(cached);
      return Date.now() - cachedData.timestamp;
    } catch {
      return 0;
    }
  }

  static getCacheAgeMinutes(): number {
    return Math.round(this.getCacheAge() / 1000 / 60);
  }

  // Cleanup methods
  static clearCampusData(): void {
    localStorage.removeItem(STORAGE_KEYS.CAMPUS_DATA);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    console.log('🗑️ Campus data cache cleared');
  }

  static clearUrgentIssues(): void {
    localStorage.removeItem(STORAGE_KEYS.URGENT_ISSUES);
    console.log('🗑️ Urgent issues cache cleared');
  }

  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ All Campus Pulse data cleared from localStorage');
  }

  // Storage info
  static getStorageInfo(): {
    totalSize: number;
    campusDataSize: number;
    urgentIssuesSize: number;
    cacheAge: number;
    isValid: boolean;
  } {
    const getItemSize = (key: string): number => {
      const item = localStorage.getItem(key);
      return item ? new Blob([item]).size : 0;
    };

    return {
      totalSize: Object.values(STORAGE_KEYS).reduce((total, key) => total + getItemSize(key), 0),
      campusDataSize: getItemSize(STORAGE_KEYS.CAMPUS_DATA),
      urgentIssuesSize: getItemSize(STORAGE_KEYS.URGENT_ISSUES),
      cacheAge: this.getCacheAge(),
      isValid: this.isCacheValid()
    };
  }

  // Export/Import for backup
  static exportData(): string {
    const data = {
      campusData: localStorage.getItem(STORAGE_KEYS.CAMPUS_DATA),
      urgentIssues: localStorage.getItem(STORAGE_KEYS.URGENT_ISSUES),
      preferences: localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES),
      exportTime: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.campusData) {
        localStorage.setItem(STORAGE_KEYS.CAMPUS_DATA, data.campusData);
      }
      if (data.urgentIssues) {
        localStorage.setItem(STORAGE_KEYS.URGENT_ISSUES, data.urgentIssues);
      }
      if (data.preferences) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, data.preferences);
      }
      
      console.log('✅ Data imported successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to import data:', error);
      return false;
    }
  }
}

// Export types for use in components
export type { UrgentIssue };