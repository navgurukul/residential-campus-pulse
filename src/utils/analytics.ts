import { getAnalytics, logEvent, setUserProperties, setUserId } from 'firebase/analytics';

// Initialize analytics
const analytics = getAnalytics();

// Custom event types for better type safety
export interface AnalyticsEvent {
  // Navigation events
  page_view: {
    page_title: string;
    page_location: string;
  };
  
  // Campus events
  campus_selected: {
    campus_id: string;
    campus_name: string;
  };
  
  campus_detail_viewed: {
    campus_id: string;
    campus_name: string;
    campus_score: number;
  };
  
  // Resolver events
  resolver_selected: {
    resolver_id: string;
    resolver_name: string;
  };
  
  resolver_feedback_viewed: {
    resolver_id: string;
    resolver_name: string;
  };
  
  // Filter events
  filter_applied: {
    filter_type: string;
    filter_value: string;
  };
  
  // Export events
  data_exported: {
    export_type: 'csv' | 'pdf';
    data_type: 'campus' | 'resolver' | 'evaluation';
    record_count: number;
  };
  
  // Search and interaction events
  search_performed: {
    search_term: string;
    results_count: number;
  };
  
  competency_analyzed: {
    competency_name: string;
    campus_id?: string;
  };
  
  // Performance events
  data_refresh: {
    data_source: 'backend' | 'mock';
    load_time_ms: number;
  };
}

// Type-safe event logging
export function trackEvent<T extends keyof AnalyticsEvent>(
  eventName: T,
  parameters: AnalyticsEvent[T]
): void {
  try {
    logEvent(analytics, eventName, parameters);
    console.log(`📊 Analytics: ${eventName}`, parameters);
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

// Page view tracking
export function trackPageView(pageName: string, additionalParams?: Record<string, any>): void {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.pathname,
    ...additionalParams
  });
}

// User identification
export function identifyUser(userId: string, properties?: Record<string, any>): void {
  try {
    setUserId(analytics, userId);
    if (properties) {
      setUserProperties(analytics, properties);
    }
    console.log(`👤 User identified: ${userId}`, properties);
  } catch (error) {
    console.warn('User identification failed:', error);
  }
}

// Campus-specific tracking
export function trackCampusInteraction(action: string, campus: any): void {
  switch (action) {
    case 'select':
      trackEvent('campus_selected', {
        campus_id: campus.id,
        campus_name: campus.name
      });
      break;
    case 'detail_view':
      trackEvent('campus_detail_viewed', {
        campus_id: campus.id,
        campus_name: campus.name,
        campus_score: campus.averageScore
      });
      break;
  }
}

// Resolver-specific tracking
export function trackResolverInteraction(action: string, resolver: any): void {
  switch (action) {
    case 'select':
      trackEvent('resolver_selected', {
        resolver_id: resolver.id,
        resolver_name: resolver.name
      });
      break;
    case 'feedback_view':
      trackEvent('resolver_feedback_viewed', {
        resolver_id: resolver.id,
        resolver_name: resolver.name
      });
      break;
  }
}

// Filter tracking
export function trackFilterUsage(filterType: string, filterValue: string): void {
  trackEvent('filter_applied', {
    filter_type: filterType,
    filter_value: filterValue
  });
}

// Export tracking
export function trackDataExport(exportType: 'csv' | 'pdf', dataType: string, recordCount: number): void {
  trackEvent('data_exported', {
    export_type: exportType,
    data_type: dataType,
    record_count: recordCount
  });
}

// Performance tracking
export function trackDataLoad(source: 'backend' | 'mock', loadTimeMs: number): void {
  trackEvent('data_refresh', {
    data_source: source,
    load_time_ms: loadTimeMs
  });
}

// Competency analysis tracking
export function trackCompetencyAnalysis(competencyName: string, campusId?: string): void {
  trackEvent('competency_analyzed', {
    competency_name: competencyName,
    campus_id: campusId
  });
}

// Error tracking
export function trackError(error: Error, context?: string): void {
  logEvent(analytics, 'exception', {
    description: error.message,
    fatal: false,
    context: context || 'unknown'
  });
  console.error('📊 Error tracked:', error.message, context);
}

// Session tracking
export function trackSessionStart(): void {
  logEvent(analytics, 'session_start', {
    timestamp: new Date().toISOString()
  });
}

export default {
  trackEvent,
  trackPageView,
  identifyUser,
  trackCampusInteraction,
  trackResolverInteraction,
  trackFilterUsage,
  trackDataExport,
  trackDataLoad,
  trackCompetencyAnalysis,
  trackError,
  trackSessionStart
};