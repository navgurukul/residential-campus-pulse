import React from 'react';
import { Filter, Download } from 'lucide-react';
import { FilterState } from '../types';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onExport: (format: 'csv' | 'pdf') => void;
  campuses: Array<{ id: string; name: string }>;
  resolvers: Array<{ id: string; name: string }>;
}

// Utility function for Title Case
const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onFilterChange, 
  onExport,
  campuses,
  resolvers 
}) => {
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      campus: '',
      resolver: '',
      dateRange: { start: '', end: '' },
      competencyCategory: '',
      competency: 'all'
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            Clear All
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onExport('csv')}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => onExport('pdf')}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Campus Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
          <select
            value={filters.campus}
            onChange={(e) => handleFilterChange('campus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Campuses</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </select>
        </div>

        {/* Resolver Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Resolver</label>
          <select
            value={filters.resolver}
            onChange={(e) => handleFilterChange('resolver', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Resolvers</option>
            {resolvers.map((resolver) => (
              <option key={resolver.id} value={resolver.id}>
                {toTitleCase(resolver.name)}
              </option>
            ))}
          </select>
        </div>

        {/* Competency Framework Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Competency Framework</label>
          <select
            value={filters.competency}
            onChange={(e) => handleFilterChange('competency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Competencies</option>
            <option value="vipassana">Vipassana</option>
            <option value="nutrition">Nutrition Supplementation + Yoga/Weight Training</option>
            <option value="houses">Houses and Reward Systems</option>
            <option value="etiocracy">Etiocracy, Co-Creation & Ownership</option>
            <option value="campus-interactions">Campus interactions</option>
            <option value="gratitude">Gratitude</option>
            <option value="hackathons">Hackathons</option>
            <option value="english-communication">English Communication & Comprehension</option>
            <option value="learning-environment">Learning Environment & Peer Support</option>
            <option value="process-principles">Process Principles Understanding & Implementation</option>
            <option value="life-skills">Life Skills Implementation</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <div className="flex space-x-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;