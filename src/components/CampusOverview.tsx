import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Award, MapPin, ArrowUpDown, Filter } from 'lucide-react';
import { Campus, Evaluation } from '../types';
import { competencyCategories } from '../data/mockData';

interface CampusOverviewProps {
  campuses: Campus[];
  evaluations: Evaluation[];
  onCampusSelect: (campusId: string) => void;
  onSort: (key: keyof Campus) => void;
  sortConfig: { key: keyof Campus; direction: 'ascending' | 'descending' } | null;
}

const CampusOverview: React.FC<CampusOverviewProps> = ({ campuses, evaluations, onCampusSelect, onSort, sortConfig }) => {
  const [selectedCompetency, setSelectedCompetency] = useState<string>('');

  const getRankingColor = (ranking: string) => {
    switch (ranking) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate competency-specific scores for each campus
  const getCompetencyScoreForCampus = (campusId: string, competency: string): number => {
    const campusEvaluations = evaluations.filter(evaluation => evaluation.campusId === campusId);
    if (campusEvaluations.length === 0) return 0;

    const competencyScores = campusEvaluations
      .flatMap(evaluation => evaluation.competencies)
      .filter(comp => comp.category === competency)
      .map(comp => comp.score);

    if (competencyScores.length === 0) return 0;
    return competencyScores.reduce((sum, score) => sum + score, 0) / competencyScores.length;
  };

  const chartData = useMemo(() => {
    return campuses.map(campus => ({
      name: campus.name,
      score: selectedCompetency 
        ? getCompetencyScoreForCampus(campus.id, selectedCompetency)
        : campus.averageScore,
      resolvers: campus.totalResolvers
    }));
  }, [campuses, selectedCompetency, evaluations]);

  const rankingData = [
    { name: 'High', value: campuses.filter(c => c.ranking === 'High').length, color: '#10B981' },
    { name: 'Medium', value: campuses.filter(c => c.ranking === 'Medium').length, color: '#F59E0B' },
    { name: 'Low', value: campuses.filter(c => c.ranking === 'Low').length, color: '#EF4444' }
  ];

  const totalResolvers = campuses.reduce((sum, campus) => sum + campus.totalResolvers, 0);
  const averageScore = campuses.reduce((sum, campus) => sum + campus.averageScore, 0) / campuses.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campuses</p>
              <p className="text-3xl font-bold text-gray-900">{campuses.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resolvers</p>
              <p className="text-3xl font-bold text-gray-900">{totalResolvers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{averageScore.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Performers</p>
              <p className="text-3xl font-bold text-gray-900">{campuses.filter(c => c.ranking === 'High').length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Campus Performance</h3>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCompetency}
                onChange={(e) => setSelectedCompetency(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Overall Score</option>
                {competencyCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0, 10]} />
              <Tooltip 
                formatter={(value: number) => [
                  value.toFixed(1), 
                  selectedCompetency || 'Overall Score'
                ]}
                labelFormatter={(label) => `Campus: ${label}`}
              />
              <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ranking Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={rankingData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {rankingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campus List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Campus Rankings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => onSort('averageScore')}>
                  <div className="flex items-center">
                    Score <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolvers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => onSort('ranking')}>
                  <div className="flex items-center">
                    Ranking <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Evaluated</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campuses.map((campus) => (
                <tr 
                  key={campus.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => onCampusSelect(campus.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{campus.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campus.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{campus.averageScore.toFixed(1)}</div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(campus.averageScore / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campus.totalResolvers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        campus.ranking === 'High' ? 'bg-green-500 animate-pulse-fast' :
                        campus.ranking === 'Medium' ? 'bg-yellow-500 animate-pulse-medium' :
                        'bg-red-500 animate-pulse-slow'
                      }`}></div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRankingColor(campus.ranking)}`}>
                        {campus.ranking}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(campus.lastEvaluated).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CampusOverview;