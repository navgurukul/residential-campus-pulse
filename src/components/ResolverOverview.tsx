import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, MapPin, TrendingUp, Calendar, MessageSquare, X, Users, BarChart3, Award } from 'lucide-react';
import { Resolver, Evaluation } from '../types';

// Helper function to parse markdown-style formatting
const parseMarkdown = (text: string) => {
  if (!text) return text;

  // First split by double line breaks to handle paragraphs
  const paragraphs = text.split(/\n\n/g);

  return paragraphs.map((paragraph, paragraphIndex) => {
    // Split each paragraph by markdown patterns
    const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);

    const parsedParts = parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** and make it bold
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-semibold text-gray-900">{boldText}</strong>;
      }
      return part;
    });

    // Return each paragraph as a div with margin bottom (except the last one)
    return (
      <div key={paragraphIndex} className={paragraphIndex < paragraphs.length - 1 ? "mb-3" : ""}>
        {parsedParts}
      </div>
    );
  });
};

interface ResolverOverviewProps {
  resolvers: Resolver[];
  evaluations?: Evaluation[];
}

const ResolverOverview: React.FC<ResolverOverviewProps> = ({ resolvers, evaluations = [] }) => {
  const [selectedResolver, setSelectedResolver] = useState<Resolver | null>(null);

  // Safety check to prevent crashes when data is loading
  if (!resolvers || !Array.isArray(resolvers)) {
    return <div className="flex items-center justify-center h-64">Loading resolver data...</div>;
  }

  const chartData = resolvers.map(resolver => ({
    name: resolver.name,
    campuses: resolver.campusesEvaluated,
    avgScore: resolver.averageScoreGiven
  }));

  const totalEvaluations = resolvers.reduce((sum, resolver) => sum + resolver.totalEvaluations, 0);
  const uniqueCampusesEvaluated = new Set(resolvers.flatMap(resolver =>
    // This is an approximation since we don't have campus names per resolver in the current data structure
    Array(resolver.campusesEvaluated).fill(0).map((_, i) => `campus-${resolver.id}-${i}`)
  )).size;
  const overallAvgScore = resolvers.length > 0 ? resolvers.reduce((sum, resolver) => sum + resolver.averageScoreGiven, 0) / resolvers.length : 0;
  const maxCampusesEvaluated = resolvers.length > 0 ? Math.max(...resolvers.map(r => r.campusesEvaluated)) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resolvers</p>
              <p className="text-3xl font-bold text-gray-900">{resolvers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
              <p className="text-3xl font-bold text-gray-900">{totalEvaluations}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Max Campuses by Resolver</p>
              <p className="text-3xl font-bold text-gray-900">{maxCampusesEvaluated}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score Given</p>
              <p className="text-3xl font-bold text-gray-900">{overallAvgScore.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Campuses Evaluated by Resolver</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                fontSize={10}
                tick={{ fontSize: 10 }}
              />
              <YAxis domain={[0, 'dataMax']} allowDecimals={false} interval={0} />
              <Tooltip />
              <Bar dataKey="campuses" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Average Scores Given</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                fontSize={10}
                tick={{ fontSize: 10 }}
              />
              <YAxis domain={[0, 7]} ticks={[0, 1, 2, 3, 4, 5, 6, 7]} />
              <Tooltip />
              <Bar dataKey="avgScore" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resolver List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Resolver Performance</h3>
          <p className="text-sm text-gray-500 mt-1">Each resolver appears once, with aggregated data from all their evaluations</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campuses Evaluated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score Given</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Evaluations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resolvers.map((resolver) => (
                <tr
                  key={resolver.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => setSelectedResolver(resolver)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="font-medium text-gray-900">{resolver.name}</div>
                      <MessageSquare className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resolver.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{resolver.campusesEvaluated}</span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(resolver.campusesEvaluated / 9) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{resolver.averageScoreGiven.toFixed(1)}</span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(resolver.averageScoreGiven / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resolver.totalEvaluations}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(resolver.lastActivity).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      {/* Resolver Feedback Modal */}
      {selectedResolver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center">
                <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedResolver.name}</h3>
                  <p className="text-sm text-gray-600">{selectedResolver.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResolver(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedResolver.campusesEvaluated}</div>
                  <div className="text-sm text-blue-800">Campuses Evaluated</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedResolver.averageScoreGiven.toFixed(1)}</div>
                  <div className="text-sm text-green-800">Average Score Given</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedResolver.totalEvaluations}</div>
                  <div className="text-sm text-purple-800">Total Evaluations</div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                  Feedback & Comments
                </h4>

                {evaluations
                  .filter(evaluation => evaluation.resolverName === selectedResolver.name)
                  .map(evaluation => {
                    const feedbackEntries = Object.entries(evaluation.competencyFeedback || {})
                      .filter(([key, value]) => value && value.trim() !== '');

                    if (feedbackEntries.length === 0 && (!evaluation.feedback || evaluation.feedback.includes('Comprehensive evaluation'))) {
                      return null;
                    }

                    return (
                      <div key={evaluation.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium text-gray-900">{evaluation.campusName}</div>
                          <div className="text-sm text-gray-500">{evaluation.dateEvaluated}</div>
                        </div>

                        {/* General Feedback */}
                        {evaluation.feedback && !evaluation.feedback.includes('Comprehensive evaluation') && (
                          <div className="mb-3">
                            <div className="text-sm font-medium text-gray-700 mb-1">General Feedback:</div>
                            <div className="text-sm text-gray-600 bg-white p-3 rounded border-l-4 border-blue-400">
                              {parseMarkdown(evaluation.feedback)}
                            </div>
                          </div>
                        )}

                        {/* Competency-specific Feedback */}
                        {feedbackEntries.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Competency Comments:</div>
                            <div className="space-y-2">
                              {feedbackEntries.map(([key, feedback], index) => (
                                <div key={key} className="bg-white p-3 rounded border-l-4 border-green-400">
                                  <div className="text-xs text-green-700 font-medium mb-1">Comment {index + 1}</div>
                                  <div className="text-sm text-gray-600">{parseMarkdown(feedback)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                  .filter(Boolean)}

                {evaluations.filter(evaluation =>
                  evaluation.resolverName === selectedResolver.name &&
                  (Object.values(evaluation.competencyFeedback || {}).some(feedback => feedback && feedback.trim() !== '') ||
                    (evaluation.feedback && !evaluation.feedback.includes('Comprehensive evaluation')))
                ).length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <div className="text-gray-500">No feedback available for this resolver yet.</div>
                      <div className="text-sm text-gray-400 mt-1">Feedback will appear here once evaluations with comments are submitted.</div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResolverOverview;