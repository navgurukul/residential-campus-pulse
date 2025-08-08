import React, { useState, useMemo, useEffect } from 'react';
import { Building2, Users, BarChart3, Settings } from 'lucide-react';
import CampusOverview from './components/CampusOverview';
import CampusDetail from './components/CampusDetail';
import ResolverOverview from './components/ResolverOverview';
import FilterPanel from './components/FilterPanel';
import LoadingSpinner from './components/LoadingSpinner';
import { FilterState, Campus, Resolver, Evaluation } from './types';
import { exportToCSV, exportToPDF, prepareCampusDataForExport, prepareResolverDataForExport, prepareEvaluationDataForExport } from './utils/exportUtils';
import { processApiData } from './utils/apiUtils';
import { mockEvaluations } from './data/mockData';

type View = 'campus-overview' | 'campus-detail' | 'resolver-overview';

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
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [resolvers, setResolvers] = useState<Resolver[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Campus; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let url = 'https://script.googleusercontent.com/a/macros/navgurukul.org/echo?user_content_key=AehSKLgQzj0ZDJkfCeFR1k2Ize5Cx6-lVWhJHdbcBqQd1UfcdUjtuC8ylC7VAmDnHMctsxtc3pIszApXcGm9JC-oov93G-UbW8YpHauDYRszWb3nWAamimC9ujdjKO5WqTKPAusk5qnleM9KDpLXJjmhFBANdCsqq55HRAt6oqMCflHd7Qs9Bs4_nnrRAFuTpCmrTOKzrnGWmUQQ5Je7LTWtnZ2Kei1s2ft_TksT7xZM__u3GCj92F1mmDOWyyPE_qmX7lZtEz2fPO9cWIATJWRwhXbxFH-ba__iDEtKkUeg0VJmJT9KQ0eAvW0UbPPVHw&lib=MNQ4Z5ed4HHZAzVnl2yR3tjPbXNLbe1dR';
      if (filters.competency) {
        if (filters.competency === 'all') {
          url += '&action=competencies';
        } else {
          url += `&competency=${filters.competency}`;
        }
      }
      try {
        const response = await fetch(url);
        const data = await response.json();
        const { campuses, resolvers, evaluations } = processApiData(data);
        setCampuses(campuses);
        setResolvers(resolvers);
        setEvaluations(evaluations);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.competency]);

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
    { id: 'resolver-overview', name: 'Resolver Overview', icon: Users }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="animated-background">
        <div className="leaf"></div>
        <div className="leaf"></div>
        <div className="leaf"></div>
        <div className="leaf"></div>
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="petal"></div>
      </div>
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
            campuses={campuses.map(c => ({ id: c.id, name: c.name }))}
            resolvers={resolvers.map(r => ({ id: r.id, name: r.name }))}
          />
        )}

        {currentView === 'campus-overview' && (
          <CampusOverview 
            campuses={filteredCampuses} 
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
          <ResolverOverview resolvers={filteredResolvers} />
        )}
      </main>
    </div>
  );
}

export default App;