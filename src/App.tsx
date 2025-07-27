import React, { useState, useMemo } from 'react';
import { Building2, Users, BarChart3, Settings } from 'lucide-react';
import CampusOverview from './components/CampusOverview';
import CampusDetail from './components/CampusDetail';
import ResolverOverview from './components/ResolverOverview';
import FilterPanel from './components/FilterPanel';
import { mockCampuses, mockResolvers, mockEvaluations } from './data/mockData';
import { FilterState } from './types';
import { exportToCSV, exportToPDF, prepareCampusDataForExport, prepareResolverDataForExport, prepareEvaluationDataForExport } from './utils/exportUtils';

type View = 'campus-overview' | 'campus-detail' | 'resolver-overview';

function App() {
  const [currentView, setCurrentView] = useState<View>('campus-overview');
  const [selectedCampusId, setSelectedCampusId] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    campus: '',
    resolver: '',
    dateRange: { start: '', end: '' },
    competencyCategory: ''
  });

  // Filter data based on current filters
  const filteredCampuses = useMemo(() => {
    return mockCampuses.filter(campus => {
      if (filters.campus && campus.id !== filters.campus) return false;
      if (filters.dateRange.start && campus.lastEvaluated < filters.dateRange.start) return false;
      if (filters.dateRange.end && campus.lastEvaluated > filters.dateRange.end) return false;
      return true;
    });
  }, [filters]);

  const filteredResolvers = useMemo(() => {
    return mockResolvers.filter(resolver => {
      if (filters.resolver && resolver.id !== filters.resolver) return false;
      if (filters.dateRange.start && resolver.lastActivity < filters.dateRange.start) return false;
      if (filters.dateRange.end && resolver.lastActivity > filters.dateRange.end) return false;
      return true;
    });
  }, [filters]);

  const filteredEvaluations = useMemo(() => {
    return mockEvaluations.filter(evaluation => {
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

  const selectedCampus = mockCampuses.find(campus => campus.id === selectedCampusId);

  const navigation = [
    { id: 'campus-overview', name: 'Campus Overview', icon: Building2 },
    { id: 'resolver-overview', name: 'Resolver Overview', icon: Users }
  ];

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
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
              <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors duration-200" />
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
                    onClick={() => setCurrentView(item.id as View)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      isActive
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
        {currentView !== 'campus-detail' && (
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onExport={handleExport}
            campuses={mockCampuses.map(c => ({ id: c.id, name: c.name }))}
            resolvers={mockResolvers.map(r => ({ id: r.id, name: r.name }))}
          />
        )}

        {currentView === 'campus-overview' && (
          <CampusOverview 
            campuses={filteredCampuses} 
            onCampusSelect={handleCampusSelect}
          />
        )}

        {currentView === 'campus-detail' && selectedCampus && (
          <CampusDetail
            campus={selectedCampus}
            evaluations={filteredEvaluations}
            onBack={handleBackToCampusOverview}
          />
        )}

        {currentView === 'resolver-overview' && (
          <ResolverOverview resolvers={filteredResolvers} />
        )}
      </main>
    </div>
  );
}

export default App;