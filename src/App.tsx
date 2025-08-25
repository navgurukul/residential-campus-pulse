import React, { useState, useMemo, useEffect } from 'react';
import { Building2, Users, BarChart3, Settings, Lock, AlertTriangle } from 'lucide-react';
import CampusOverview from './components/CampusOverview';
import CampusDetail from './components/CampusDetail';
import ResolverOverview from './components/ResolverOverview';
import UrgentIssues from './components/UrgentIssues';
import FilterPanel from './components/FilterPanel';
import LoadingSpinner from './components/LoadingSpinner';
import CacheManager from './components/CacheManager';
import { FilterState, Campus, Resolver, Evaluation } from './types';
import { exportToCSV, exportToPDF, prepareCampusDataForExport, prepareResolverDataForExport, prepareEvaluationDataForExport } from './utils/exportUtils';
import { fetchCampusData, refreshCampusData, getCacheStatus } from './utils/apiUtils';
import { LocalStorageManager } from './utils/localStorage';
import { mockEvaluations } from './data/mockData';

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
  const [cacheStatus, setCacheStatus] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Campus; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Use the new localStorage-integrated fetch function
        const data = await fetchCampusData();
        
        setCampuses(data.campuses);
        setResolvers(data.resolvers);
        setEvaluations(data.evaluations);
        
        // Update cache status
        const status = getCacheStatus();
        setCacheStatus(status);
        setLastUpdated(status.lastSync || new Date().toISOString());
        
        console.log('✅ Data loaded successfully:', {
          campuses: data.campuses.length,
          resolvers: data.resolvers.length,
          evaluations: data.evaluations.length,
          cacheStatus: status
        });
        
      } catch (error) {
        console.error('❌ Failed to load data:', error);
        
        // Fallback to mock data
        setCampuses([]);
        setResolvers([]);
        setEvaluations(mockEvaluations);
        setLastUpdated(new Date().toISOString());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters.competency]);

  // Function to refresh data (force fetch from backend)
  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await refreshCampusData();
      setCampuses(data.campuses);
      setResolvers(data.resolvers);
      setEvaluations(data.evaluations);
      
      const status = getCacheStatus();
      setCacheStatus(status);
      setLastUpdated(status.lastSync || new Date().toISOString());
      
      console.log('✅ Data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to clear all cache
  const clearAllCache = () => {
    LocalStorageManager.clearAllData();
    console.log('🗑️ All cache cleared');
    window.location.reload();
  };

  // Add keyboard shortcuts for cache management
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey) {
        if (event.key === 'R') {
          event.preventDefault();
          if (confirm('Refresh data from backend?')) {
            refreshData();
          }
        } else if (event.key === 'C') {
          event.preventDefault();
          if (confirm('Clear all cached data and reload?')) {
            clearAllCache();
          }
        } else if (event.key === 'I') {
          event.preventDefault();
          // Show cache info
          const info = LocalStorageManager.getStorageInfo();
          const status = getCacheStatus();
          alert(`Cache Info:
Size: ${Math.round(info.totalSize / 1024)}KB
Age: ${status.ageMinutes} minutes
Valid: ${info.isValid}
Last Sync: ${status.lastSync}
Offline Mode: ${status.isOffline}`);
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
                {cacheStatus ? (
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${cacheStatus.isValid ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      <span className="hidden md:inline">
                        {cacheStatus.isValid ? 'Cached' : 'Stale'}: 
                      </span>
                      <span className="md:hidden">
                        {cacheStatus.ageMinutes}m
                      </span>
                    </div>
                    <span className="font-mono text-xs">
                      {lastUpdated && new Date(lastUpdated).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      ({cacheStatus.sizeKB}KB • Ctrl+Shift+R to refresh)
                    </span>
                  </div>
                ) : (
                  <>Loading cache status...</>
                )}
              </div>
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

      {/* Cache Manager - Always available */}
      <CacheManager onDataRefresh={() => window.location.reload()} />
    </div>
  );
}

export default App;