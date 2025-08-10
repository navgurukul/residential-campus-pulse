import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Award, MapPin, ArrowUpDown, Filter, BarChart3 } from 'lucide-react';
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

  // Safety check to prevent crashes when data is loading
  if (!campuses || !Array.isArray(campuses)) {
    return <div className="flex items-center justify-center h-64">Loading campus data...</div>;
  }



  // Helper function to calculate level based on 0-7 score scale mapping to 0-4 levels
  const getCampusLevel = (score: number): string => {
    // Convert score to level (0-7 score maps to Level 0-4)
    if (score >= 6.5) return 'Level 4';
    if (score >= 4.5) return 'Level 3';
    if (score >= 2.5) return 'Level 2';
    if (score >= 1) return 'Level 1';
    return 'Level 0';
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
      name: campus.status === 'Relocated' ? `${campus.name} (→${campus.relocatedTo})` : campus.name,
      score: selectedCompetency
        ? getCompetencyScoreForCampus(campus.id, selectedCompetency)
        : campus.averageScore,
      resolvers: campus.totalResolvers
    }));
  }, [campuses, selectedCompetency, evaluations]);

  // Only include active campuses in level distribution
  const activeCampuses = campuses.filter(campus => campus.status !== 'Relocated');

  const rankingData = [
    { name: 'Level 4', value: activeCampuses.filter(c => getCampusLevel(c.averageScore) === 'Level 4').length, color: '#059669' },
    { name: 'Level 3', value: activeCampuses.filter(c => getCampusLevel(c.averageScore) === 'Level 3').length, color: '#3B82F6' },
    { name: 'Level 2', value: activeCampuses.filter(c => getCampusLevel(c.averageScore) === 'Level 2').length, color: '#F59E0B' },
    { name: 'Level 1', value: activeCampuses.filter(c => getCampusLevel(c.averageScore) === 'Level 1').length, color: '#F97316' },
    { name: 'Level 0', value: activeCampuses.filter(c => getCampusLevel(c.averageScore) === 'Level 0').length, color: '#EF4444' }
  ].filter(item => item.value > 0); // Filter out zero values to prevent overlapping labels

  const totalResolvers = campuses.reduce((sum, campus) => sum + campus.totalResolvers, 0);
  const averageScore = campuses.length > 0 ? campuses.reduce((sum, campus) => sum + campus.averageScore, 0) / campuses.length : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campuses</p>
              <p className="text-3xl font-bold text-gray-900">{campuses.filter(campus => campus.status !== 'Relocated').length}</p>
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
              <p className="text-3xl font-bold text-gray-900">{activeCampuses.filter(c => {
                const level = getCampusLevel(c.averageScore);
                return ['Level 3', 'Level 4'].includes(level);
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
                <option value="">Latest Score</option>
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
                  selectedCompetency || 'Latest Score'
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
                    <div className="flex items-center">
                      <div className="font-medium text-gray-900">{campus.name}</div>
                      {campus.status === 'Relocated' && (
                        <div className="ml-2 flex items-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Relocated to {campus.relocatedTo}
                          </span>
                        </div>
                      )}
                      {campus.status === 'Active' && campus.name === 'Raigarh' && (
                        <div className="ml-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            New Campus
                          </span>
                        </div>
                      )}
                    </div>
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
                          <div className={`w-3 h-3 rounded-full mr-2 ${['Level 6', 'Level 7'].includes(campusLevel) ? 'bg-emerald-500 animate-pulse-fast' :
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

      {/* Comprehensive Campus Analytics Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Campus Performance Analytics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Analytics Cards */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Top Performing Campus</p>
                <p className="text-lg font-bold text-emerald-900">
                  {activeCampuses.length > 0 ? activeCampuses.reduce((prev, current) =>
                    (prev.averageScore > current.averageScore) ? prev : current
                  ).name : 'N/A'}
                </p>
                <p className="text-xs text-emerald-600">
                  Score: {activeCampuses.length > 0 ? activeCampuses.reduce((prev, current) =>
                    (prev.averageScore > current.averageScore) ? prev : current
                  ).averageScore.toFixed(1) : '0'}/7
                </p>
              </div>
              <Award className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Most Evaluated Campus</p>
                <p className="text-lg font-bold text-blue-900">
                  {activeCampuses.length > 0 ? activeCampuses.reduce((prev, current) =>
                    (prev.totalResolvers > current.totalResolvers) ? prev : current
                  ).name : 'N/A'}
                </p>
                <p className="text-xs text-blue-600">
                  {activeCampuses.length > 0 ? activeCampuses.reduce((prev, current) =>
                    (prev.totalResolvers > current.totalResolvers) ? prev : current
                  ).totalResolvers : 0} evaluators
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Score Variance</p>
                <p className="text-lg font-bold text-purple-900">
                  {activeCampuses.length > 0 ? (Math.max(...activeCampuses.map(c => c.averageScore)) - Math.min(...activeCampuses.map(c => c.averageScore))).toFixed(1) : '0.0'}
                </p>
                <p className="text-xs text-purple-600">Points difference</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Evaluation Coverage</p>
                <p className="text-lg font-bold text-orange-900">
                  {activeCampuses.length > 0 ? ((activeCampuses.reduce((sum, c) => sum + c.totalResolvers, 0) / (activeCampuses.length * 11)) * 100).toFixed(1) : '0.0'}%
                </p>
                <p className="text-xs text-orange-600">Avg resolver participation</p>
              </div>
              <MapPin className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Campus Performance Tiers</h4>
            <div className="space-y-3">
              {[
                { name: 'Excellent (Level 4)', level: 'Level 4', color: 'bg-emerald-500' },
                { name: 'Good (Level 3)', level: 'Level 3', color: 'bg-blue-500' },
                { name: 'Average (Level 2)', level: 'Level 2', color: 'bg-yellow-500' },
                { name: 'Below Average (Level 1)', level: 'Level 1', color: 'bg-orange-500' },
                { name: 'Needs Improvement (Level 0)', level: 'Level 0', color: 'bg-red-500' }
              ].map((tier, index) => {
                const count = activeCampuses.filter(c => getCampusLevel(c.averageScore) === tier.level).length;
                const percentage = (count / activeCampuses.length) * 100;

                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{tier.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${tier.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Campus Insights</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-sm font-medium text-gray-700">Highest Scoring Campus</span>
                <span className="text-lg font-bold text-green-600">
                  {activeCampuses.length > 0 ? Math.max(...activeCampuses.map(c => c.averageScore)).toFixed(1) : '0.0'}/7
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-sm font-medium text-gray-700">Lowest Scoring Campus</span>
                <span className="text-lg font-bold text-red-600">
                  {activeCampuses.length > 0 ? Math.min(...activeCampuses.map(c => c.averageScore)).toFixed(1) : '0.0'}/7
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-sm font-medium text-gray-700">Most Recent Evaluation</span>
                <span className="text-sm font-medium text-gray-900">
                  {activeCampuses.length > 0 ? new Date(Math.max(...activeCampuses.map(c => new Date(c.lastEvaluated).getTime()))).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-sm font-medium text-gray-700">Campuses Above Average</span>
                <span className="text-lg font-bold text-blue-600">
                  {activeCampuses.filter(c => c.averageScore > averageScore).length}/{activeCampuses.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Strategic Recommendations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg">
              <h5 className="font-medium text-gray-800 mb-2">🎯 Focus Areas</h5>
              <p className="text-sm text-gray-600">
                {activeCampuses.filter(c => getCampusLevel(c.averageScore) === 'Level 0').length} campuses need immediate attention.
                Prioritize support for lowest-performing locations.
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <h5 className="font-medium text-gray-800 mb-2">📊 Best Practices</h5>
              <p className="text-sm text-gray-600">
                Study practices from {activeCampuses.filter(c => getCampusLevel(c.averageScore) === 'Level 4').length} top-performing campuses.
                Share successful strategies across network.
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <h5 className="font-medium text-gray-800 mb-2">🔄 Evaluation Frequency</h5>
              <p className="text-sm text-gray-600">
                Average {activeCampuses.length > 0 ? (activeCampuses.reduce((sum, c) => sum + c.totalResolvers, 0) / activeCampuses.length).toFixed(1) : '0'} evaluators per campus.
                Consider increasing evaluation frequency for better insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusOverview;