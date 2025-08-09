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



  // Helper function to calculate level based on 0-7 scale
  const getCampusLevel = (score: number): string => {
    // Convert score to level (0-7 maps to Level 0-7)
    const level = Math.floor(score); // Direct mapping: score 1.9 = Level 1, score 3.2 = Level 3, etc.
    return `Level ${Math.min(7, Math.max(0, level))}`;
  };

  // Helper function for level colors
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Level 7': return 'text-emerald-600 bg-emerald-100';
      case 'Level 6': return 'text-green-600 bg-green-100';
      case 'Level 5': return 'text-lime-600 bg-lime-100';
      case 'Level 4': return 'text-blue-600 bg-blue-100';
      case 'Level 3': return 'text-cyan-600 bg-cyan-100';
      case 'Level 2': return 'text-yellow-600 bg-yellow-100';
      case 'Level 1': return 'text-orange-600 bg-orange-100';
      case 'Level 0': return 'text-red-600 bg-red-100';
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
    { name: 'Level 7', value: campuses.filter(c => getCampusLevel(c.averageScore) === 'Level 7').length, color: '#059669' },
    { name: 'Level 6', value: campuses.filter(c => getCampusLevel(c.averageScore) === 'Level 6').length, color: '#10B981' },
    { name: 'Level 5', value: campuses.filter(c => getCampusLevel(c.averageScore) === 'Level 5').length, color: '#65A30D' },
    { name: 'Level 4', value: campuses.filter(c => getCampusLevel(c.averageScore) === 'Level 4').length, color: '#3B82F6' },
    { name: 'Level 3', value: campuses.filter(c => getCampusLevel(c.averageScore) === 'Level 3').length, color: '#0891B2' },
    { name: 'Level 2', value: campuses.filter(c => getCampusLevel(c.averageScore) === 'Level 2').length, color: '#F59E0B' },
    { name: 'Level 1', value: campuses.filter(c => getCampusLevel(c.averageScore) === 'Level 1').length, color: '#F97316' },
    { name: 'Level 0', value: campuses.filter(c => getCampusLevel(c.averageScore) === 'Level 0').length, color: '#EF4444' }
  ].filter(item => item.value > 0); // Filter out zero values to prevent overlapping labels

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
              <p className="text-sm font-medium text-gray-600">Top Level Campuses</p>
              <p className="text-3xl font-bold text-gray-900">{campuses.filter(c => {
                const level = getCampusLevel(c.averageScore);
                return ['Level 6', 'Level 7'].includes(level);
              }).length}</p>
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
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e0e0e0"
                horizontalPoints={[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7]}
              />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 7]} 
                type="number"
                ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
                tickCount={8}
                interval={0}
                allowDecimals={true}
                tick={{ fontSize: 12 }}
              />
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Level Distribution</h3>
          {rankingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                <Pie
                  data={rankingData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => value > 0 ? `${value} Campuses\nat ${name}` : ''}
                  labelLine={false}
                >
                  {rankingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-lg font-medium">No Campus Data</p>
                <p className="text-sm">Add campus evaluations to see ranking distribution</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campus List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Campus Levels</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    Level
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
                          style={{ width: `${(campus.averageScore / 7) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campus.totalResolvers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const campusLevel = getCampusLevel(campus.averageScore);
                      return (
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            ['Level 6', 'Level 7'].includes(campusLevel) ? 'bg-emerald-500 animate-pulse-fast' :
                            ['Level 4', 'Level 5'].includes(campusLevel) ? 'bg-green-500 animate-pulse-medium' :
                            ['Level 2', 'Level 3'].includes(campusLevel) ? 'bg-blue-500 animate-pulse-medium' :
                            campusLevel === 'Level 1' ? 'bg-yellow-500 animate-pulse-medium' :
                            'bg-red-500 animate-pulse-slow'
                          }`}></div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(campusLevel)}`}>
                            {campusLevel}
                          </span>
                        </div>
                      );
                    })()}
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