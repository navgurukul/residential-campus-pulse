import React, { useState, useMemo, useEffect } from 'react';
import { Building2, Users, BarChart3, Settings, Lock, AlertTriangle, RefreshCw } from 'lucide-react';
import CampusOverview from './components/CampusOverview';
import CampusDetail from './components/CampusDetail';
import ResolverOverview from './components/ResolverOverview';
import UrgentIssues from './components/UrgentIssues';
import FilterPanel from './components/FilterPanel';
import LoadingSpinner from './components/LoadingSpinner';

import { FilterState, Campus, Resolver, Evaluation } from './types';
import { exportToCSV, exportToPDF, prepareCampusDataForExport, prepareResolverDataForExport, prepareEvaluationDataForExport } from './utils/exportUtils';
import { processApiData } from './utils/apiUtils';
import { mockEvaluations } from './data/mockData';
import { trackPageView, trackCampusInteraction, trackFilterUsage, trackDataExport, trackDataLoad } from './utils/analytics';

type View = 'campus-overview' | 'campus-detail' | 'resolver-overview' | 'urgent-issues';

function App() {
  const [currentView, setCurrentView] = useState<View>('campus-overview');
  const [selectedCampusId, setSelectedCampusId] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    campus: '',
    resolver: '',
    dateRange: { start: '', end: '' },
    competencyCategory: '',
    competency: 'vipasana', // Default to 'vipasana'
  });

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'urgent-issues' || hash === 'campus-overview' || hash === 'resolver-overview') {
        setCurrentView(hash as View);
        // Track page view
        trackPageView(hash);
      }
    };

    // Set initial view based on hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [resolvers, setResolvers] = useState<Resolver[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Campus; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // First, try to load from localStorage
      try {
        const cachedData = localStorage.getItem('campus-pulse-data');
        const cachedTimestamp = localStorage.getItem('campus-pulse-timestamp');
        
        if (cachedData && cachedTimestamp) {
          const data = JSON.parse(cachedData);
          const timestamp = parseInt(cachedTimestamp);
          const now = Date.now();
          
          // Use cached data if it has valid data (no expiry check)
          if (data.campuses && data.resolvers && data.evaluations) {
            setCampuses(data.campuses);
            setResolvers(data.resolvers);
            setEvaluations(data.evaluations);
            setLastUpdated(data.lastUpdated);
            setLoading(false);
            console.log('Data loaded from cache:', {
              campuses: data.campuses.length,
              resolvers: data.resolvers.length,
              evaluations: data.evaluations.length,
              lastUpdated: data.lastUpdated,
              cacheAge: Math.round((now - timestamp) / 1000 / 60) + ' minutes ago'
            });
            return;
          }
        }
      } catch (error) {
        console.log('Cache read error, fetching fresh data:', error);
      }
      
      // If no valid cache, fetch from backend
      try {
        const response = await fetch('https://ng-campus-pulse.onrender.com/api/campus-data');
        const data = await response.json();
        
        if (data.campuses && data.resolvers && data.evaluations && 
            data.campuses.length > 0 && data.resolvers.length > 0) {
          // Use data directly from backend (already processed)
          setCampuses(data.campuses);
          setResolvers(data.resolvers);
          setEvaluations(data.evaluations);
          setLastUpdated(data.lastUpdated);
          
          // Cache the successful response
          localStorage.setItem('campus-pulse-data', JSON.stringify(data));
          localStorage.setItem('campus-pulse-timestamp', Date.now().toString());
          
          console.log('✅ Data loaded from backend and cached:', {
            campuses: data.campuses.length,
            resolvers: data.resolvers.length,
            evaluations: data.evaluations.length,
            lastUpdated: data.lastUpdated
          });
        } else {
          // Backend has no data - show clear message and use mock data
          console.warn('⚠️ Backend has no data. This usually means:');
          console.warn('1. Google Apps Script hasn\'t pushed data yet');
          console.warn('2. Backend server restarted and lost in-memory data');
          console.warn('3. No form submissions have been processed');
          console.warn('Using mock data as fallback...');
          
          const { campuses, resolvers, evaluations } = processApiData({ responses: [] });
          setCampuses(campuses);
          setResolvers(resolvers);
          setEvaluations(mockEvaluations);
          setLastUpdated('No real data - using mock data for demo');
        }
      } catch (error) {
        console.error('Error fetching data from backend:', error);
        // Fallback to mock data on error
        console.log('Backend error, using mock data');
        const { campuses, resolvers, evaluations } = processApiData({ responses: [] });
        setCampuses(campuses);
        setResolvers(resolvers);
        setEvaluations(mockEvaluations);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.competency]);

  // Function to clear cache (for admin use)
  const clearCache = () => {
    localStorage.removeItem('campus-pulse-data');
    localStorage.removeItem('campus-pulse-timestamp');
    console.log('Cache cleared - refresh page to fetch fresh data');
    // Optionally reload the page to fetch fresh data
    window.location.reload();
  };

  // Function to refresh data (force fetch from backend)
  const refreshData = async () => {
    setLoading(true);
    
    // Clear cache first
    localStorage.removeItem('campus-pulse-data');
    localStorage.removeItem('campus-pulse-timestamp');
    
    try {
      console.log('🔄 Force refreshing data from backend...');
      const response = await fetch('https://ng-campus-pulse.onrender.com/api/campus-data');
      const data = await response.json();
      
      if (data.campuses && data.resolvers && data.evaluations) {
        setCampuses(data.campuses);
        setResolvers(data.resolvers);
        setEvaluations(data.evaluations);
        setLastUpdated(data.lastUpdated);
        
        // Cache the fresh data
        localStorage.setItem('campus-pulse-data', JSON.stringify(data));
        localStorage.setItem('campus-pulse-timestamp', Date.now().toString());
        
        console.log('✅ Data refreshed successfully:', {
          campuses: data.campuses.length,
          resolvers: data.resolvers.length,
          evaluations: data.evaluations.length
        });
      } else {
        console.warn('⚠️ No data available from backend');
      }
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add keyboard shortcut for cache clearing (Ctrl+Shift+C)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        if (confirm('Clear cached data and reload fresh data from backend?')) {
          clearCache();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Filter and sort data based on current filters and sort configuration
  const filteredCampuses = useMemo(() => {
    let sortableCampuses = [...campuses];
    if (sortConfig !== null) {
      sortableCampuses.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableCampuses.filter(campus => {
      if (filters.campus && campus.id !== filters.campus) return false;
      if (filters.dateRange.start && campus.lastEvaluated < filters.dateRange.start) return false;
      if (filters.dateRange.end && campus.lastEvaluated > filters.dateRange.end) return false;
      return true;
    });
  }, [filters, campuses, sortConfig]);

  const filteredResolvers = useMemo(() => {
    return resolvers.filter(resolver => {
      if (filters.resolver && resolver.id !== filters.resolver) return false;
      if (filters.dateRange.start && resolver.lastActivity < filters.dateRange.start) return false;
      if (filters.dateRange.end && resolver.lastActivity > filters.dateRange.end) return false;
      return true;
    });
  }, [filters, resolvers]);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(evaluation => {
      if (filters.campus && evaluation.campusId !== filters.campus) return false;
      if (filters.resolver && evaluation.resolverId !== filters.resolver) return false;
      if (filters.dateRange.start && evaluation.dateEvaluated < filters.dateRange.start) return false;
      if (filters.dateRange.end && evaluation.dateEvaluated > filters.dateRange.end) return false;
      if (filters.competencyCategory) {
        const hasCategory = evaluation.competencies.some(comp => comp.category === filters.competencyCategory);
        if (!hasCategory) return false;
      }
      return true;
    });
  }, [filters]);

  const handleCampusSelect = (campusId: string) => {
    setSelectedCampusId(campusId);
    setCurrentView('campus-detail');
  };

  const handleBackToCampusOverview = () => {
    setCurrentView('campus-overview');
    setSelectedCampusId('');
  };

  const handleSort = (key: keyof Campus) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      if (currentView === 'campus-overview') {
        const data = prepareCampusDataForExport(filteredCampuses);
        exportToCSV(data, 'campus-overview');
      } else if (currentView === 'resolver-overview') {
        const data = prepareResolverDataForExport(filteredResolvers);
        exportToCSV(data, 'resolver-overview');
      }
    } else if (format === 'pdf') {
      exportToPDF('main-content', `${currentView}-report`);
    }
  };

  const selectedCampus = campuses.find(campus => campus.id === selectedCampusId);

  const navigation = [
    { id: 'campus-overview', name: 'Campus Overview', icon: Building2 },
    { id: 'resolver-overview', name: 'Resolver Overview', icon: Users },
    { id: 'urgent-issues', name: 'Urgent Issues', icon: AlertTriangle }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Navgurukul Campus Pulse</h1>
                <p className="text-sm text-gray-500">Track and analyze campus performance evaluations</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                {lastUpdated ? (
                  lastUpdated.includes('mock data') ? (
                    <div className="flex flex-col md:flex-row md:items-center">
                      <span className="text-orange-600 font-medium">⚠️ No Real Data Available</span>
                      <span className="text-xs text-orange-500 ml-1">(Using demo data - Admin needs to sync from Google Sheets)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center">
                      <span className="hidden md:inline">Data cached: </span>
                      <span className="md:hidden">Cached: </span>
                      <span className="font-mono">
                        {new Date(lastUpdated).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">(Persistent cache - Ctrl+Shift+C to clear)</span>
                    </div>
                  )
                ) : (
                  <>Data cleared for privacy - Admin refresh required</>
                )}
              </div>
              <button
                onClick={refreshData}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200 flex-shrink-0"
                title="Refresh data from backend"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div
                className="p-2 text-gray-400 flex-shrink-0"
                title="Data refresh restricted to admin access only"
              >
                <Lock className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors duration-200 flex-shrink-0" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {currentView !== 'campus-detail' && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      window.location.hash = item.id;
                      setCurrentView(item.id as View);
                    }}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content">
        {/* Process Principles Framework Link */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Process Principles Framework</h3>
              <p className="text-xs text-blue-700 mt-1">Understanding & Implementation guidelines for team members</p>
            </div>
            <a
              href="https://docs.google.com/document/d/1G9zxUyv4NKIXJpYy04ehRt1MgdSFspj-DnyGhraHJ0k/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              View Document
            </a>
          </div>
        </div>

        {currentView !== 'campus-detail' && currentView !== 'urgent-issues' && (
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onExport={handleExport}
            campuses={campuses.map(c => ({ id: c.id, name: c.name }))}
            resolvers={resolvers.map(r => ({ id: r.id, name: r.name }))}
            currentView={currentView}
          />
        )}

        {currentView === 'campus-overview' && (
          <CampusOverview
            campuses={filteredCampuses}
            evaluations={evaluations.length > 0 ? evaluations : mockEvaluations}
            onCampusSelect={handleCampusSelect}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        )}

        {currentView === 'campus-detail' && selectedCampus && (
          <CampusDetail
            campus={selectedCampus}
            evaluations={evaluations.length > 0 ? evaluations : mockEvaluations}
            onBack={handleBackToCampusOverview}
          />
        )}

        {currentView === 'resolver-overview' && (
          <ResolverOverview 
            resolvers={filteredResolvers} 
            evaluations={evaluations.length > 0 ? evaluations : mockEvaluations}
          />
        )}

        {currentView === 'urgent-issues' && (
          <UrgentIssues />
        )}
      </main>


    </div>
  );
}

export default App;