import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ArrowLeft, MessageSquare, Calendar, User, Download, FileText } from 'lucide-react';
import { Campus, Evaluation } from '../types';
import { competencyCategories } from '../data/mockData';
import { exportToPDF, exportToCSV, prepareCampusDetailDataForExport } from '../utils/exportUtils';

interface CampusDetailProps {
  campus: Campus;
  evaluations: Evaluation[];
  onBack: () => void;
}

const CampusDetail: React.FC<CampusDetailProps> = ({ campus, evaluations, onBack }) => {
  const campusEvaluations = evaluations.filter(evaluation => evaluation.campusId === campus.id);
  
  // Check if this is a new campus with no evaluations
  const hasNoEvaluations = campusEvaluations.length === 0;
  
  // Convert score to level-based ranking
  const getScoreLevel = (score: number): { level: string; color: string; bgColor: string } => {
    if (score >= 6.0) return { level: 'Level 4', color: 'text-green-700', bgColor: 'bg-green-600' };
    if (score >= 4.0) return { level: 'Level 3', color: 'text-blue-700', bgColor: 'bg-blue-600' };
    if (score >= 2.0) return { level: 'Level 2', color: 'text-yellow-700', bgColor: 'bg-yellow-600' };
    if (score >= 1.0) return { level: 'Level 1', color: 'text-orange-700', bgColor: 'bg-orange-600' };
    return { level: 'Level 0', color: 'text-red-700', bgColor: 'bg-red-600' };
  };
  
  const campusLevel = getScoreLevel(campus.averageScore);
  
  // Prepare radar chart data
  const radarData = campusEvaluations.length > 0 
    ? campusEvaluations[0].competencies.map(comp => ({
        category: comp.category,
        score: comp.score,
        maxScore: comp.maxScore
      }))
    : [];

  // Prepare resolver scores chart data
  const resolverScores = campusEvaluations.map(evaluation => ({
    resolver: evaluation.resolverName.split(' ').pop(), // Last name
    score: evaluation.overallScore
  }));

  const handleExportPDF = () => {
    exportToPDF('campus-detail-content', `${campus.name}-campus-report`);
  };

  const handleExportCSV = () => {
    const data = prepareCampusDetailDataForExport(campus, campusEvaluations);
    exportToCSV(data.evaluations, `${campus.name}-evaluations`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{campus.name}</h1>
              {campus.status === 'Relocated' && (
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  Campus Relocated to {campus.relocatedTo}
                </span>
              )}
              {hasNoEvaluations && campus.name === 'Raigarh' && (
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  New Campus
                </span>
              )}
            </div>
            <p className="text-gray-600">{campus.location}</p>
            {campus.status === 'Relocated' && (
              <p className="text-sm text-orange-600 mt-1">
                This campus has been relocated. Historical evaluation data is preserved below.
              </p>
            )}
            {hasNoEvaluations && campus.name === 'Raigarh' && (
              <p className="text-sm text-green-600 mt-1">
                This is a new campus. No evaluations have been conducted yet.
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <FileText className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{campus.averageScore.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Overall Score</div>
          </div>
        </div>
      </div>

      {/* Main Content for PDF Export */}
      <div id="campus-detail-content" className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resolvers</p>
              <p className="text-2xl font-bold text-gray-900">{campus.totalResolvers}</p>
            </div>
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Evaluations</p>
              <p className="text-2xl font-bold text-gray-900">{campusEvaluations.length}</p>
            </div>
            <MessageSquare className={`w-8 h-8 ${campusEvaluations.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Campus Level</p>
              <p className={`text-2xl font-bold ${campusLevel.color}`}>{campusLevel.level}</p>
              <p className="text-xs text-gray-500 mt-1">Score: {campus.averageScore.toFixed(1)}</p>
            </div>
            <div className={`w-8 h-8 rounded-full ${campusLevel.bgColor} flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">
                {campusLevel.level.split(' ')[1]}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Evaluated</p>
              <p className="text-2xl font-bold text-gray-900">{new Date(campus.lastEvaluated).toLocaleDateString()}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Competency Analysis</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 7]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
              <div className="text-center">
                <p className="font-medium">No evaluation data available</p>
                {hasNoEvaluations && campus.name === 'Raigarh' && (
                  <p className="text-sm mt-1">This new campus hasn't been evaluated yet</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolver Scores</h3>
          {resolverScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resolverScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="resolver" />
                <YAxis domain={[0, 7]} />
                <Tooltip />
                <Bar dataKey="score" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <User className="w-12 h-12 mb-3 opacity-50" />
              <div className="text-center">
                <p className="font-medium">No resolver scores available</p>
                {hasNoEvaluations && campus.name === 'Raigarh' && (
                  <p className="text-sm mt-1">No resolvers have evaluated this campus yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Evaluations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Evaluations</h3>
        </div>
        
        {!hasNoEvaluations ? (
          <div className="p-6 space-y-6">
            {campusEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{evaluation.resolverName}</h4>
                    <p className="text-sm text-gray-500">Evaluated on {new Date(evaluation.dateEvaluated).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">{evaluation.overallScore}</div>
                    <div className="text-xs text-gray-500">Overall Score</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {evaluation.competencies.map((comp, index) => {
                    const competencyLevel = getScoreLevel(comp.score);
                    return (
                      <div key={index} className="text-center">
                        <div className="text-sm font-medium text-gray-900">{comp.score}/{comp.maxScore}</div>
                        <div className={`text-xs font-medium ${competencyLevel.color}`}>{competencyLevel.level}</div>
                        <div className="text-xs text-gray-500 truncate" title={comp.category}>{comp.category}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              comp.score >= 6.0 ? 'bg-green-600' :
                              comp.score >= 4.0 ? 'bg-blue-600' :
                              comp.score >= 2.0 ? 'bg-yellow-600' :
                              comp.score >= 1.0 ? 'bg-orange-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${(comp.score / comp.maxScore) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Enhanced Feedback Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h5 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Resolver Feedback & Comments
                  </h5>
                  
                  {/* General Feedback */}
                  {evaluation.feedback && !evaluation.feedback.includes('Comprehensive evaluation') && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-blue-700 mb-1 bg-blue-100 px-2 py-1 rounded inline-block">
                        General Feedback
                      </div>
                      <div className="text-sm text-gray-700 bg-white p-3 rounded border-l-4 border-blue-400 mt-1">
                        {evaluation.feedback}
                      </div>
                    </div>
                  )}
                  
                  {/* Competency-specific Feedback */}
                  {evaluation.competencyFeedback && Object.keys(evaluation.competencyFeedback).length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-blue-700 mb-2 bg-blue-100 px-2 py-1 rounded inline-block">
                        Competency-Specific Comments
                      </div>
                      <div className="space-y-2 mt-1">
                        {Object.entries(evaluation.competencyFeedback)
                          .filter(([key, value]) => {
                            // Filter out empty, meaningless, or generic responses
                            if (!value || typeof value !== 'string') return false;
                            const cleanValue = value.trim().toLowerCase();
                            return cleanValue !== '' && 
                                   cleanValue !== 'na' && 
                                   cleanValue !== 'no' && 
                                   cleanValue !== 'nope' &&
                                   cleanValue !== 'none' &&
                                   cleanValue.length > 3 &&
                                   !key.includes('General Comment') && // Filter out generic numbered comments
                                   !key.includes('Additional Feedback'); // Filter out generic additional feedback
                          })
                          .map(([competencyName, feedback]) => {
                            // Determine the color based on competency type
                            const getCompetencyColor = (name: string) => {
                              if (name.includes('Vipassana')) return 'border-purple-400 bg-purple-50';
                              if (name.includes('Nutrition') || name.includes('Yoga')) return 'border-green-400 bg-green-50';
                              if (name.includes('Houses') || name.includes('Reward')) return 'border-yellow-400 bg-yellow-50';
                              if (name.includes('Etiocracy') || name.includes('Ownership')) return 'border-blue-400 bg-blue-50';
                              if (name.includes('Campus interactions')) return 'border-indigo-400 bg-indigo-50';
                              if (name.includes('Gratitude')) return 'border-pink-400 bg-pink-50';
                              if (name.includes('Hackathons')) return 'border-red-400 bg-red-50';
                              if (name.includes('English')) return 'border-teal-400 bg-teal-50';
                              if (name.includes('Learning Environment')) return 'border-cyan-400 bg-cyan-50';
                              if (name.includes('Process Principles')) return 'border-orange-400 bg-orange-50';
                              if (name.includes('Life Skills')) return 'border-emerald-400 bg-emerald-50';
                              return 'border-gray-400 bg-gray-50';
                            };

                            return (
                              <div key={competencyName} className={`bg-white p-3 rounded border-l-4 ${getCompetencyColor(competencyName)}`}>
                                <div className="text-xs font-medium mb-1 flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    competencyName.includes('Vipassana') ? 'bg-purple-500' :
                                    competencyName.includes('Nutrition') || competencyName.includes('Yoga') ? 'bg-green-500' :
                                    competencyName.includes('Houses') || competencyName.includes('Reward') ? 'bg-yellow-500' :
                                    competencyName.includes('Etiocracy') || competencyName.includes('Ownership') ? 'bg-blue-500' :
                                    competencyName.includes('Campus interactions') ? 'bg-indigo-500' :
                                    competencyName.includes('Gratitude') ? 'bg-pink-500' :
                                    competencyName.includes('Hackathons') ? 'bg-red-500' :
                                    competencyName.includes('English') ? 'bg-teal-500' :
                                    competencyName.includes('Learning Environment') ? 'bg-cyan-500' :
                                    competencyName.includes('Process Principles') ? 'bg-orange-500' :
                                    competencyName.includes('Life Skills') ? 'bg-emerald-500' :
                                    'bg-gray-500'
                                  }`}></div>
                                  <span className="text-gray-700">
                                    {competencyName.length > 50 ? `${competencyName.substring(0, 50)}...` : competencyName}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-700 ml-4">{feedback}</div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                  
                  {/* Default feedback fallback */}
                  {(!evaluation.feedback || evaluation.feedback.includes('Comprehensive evaluation')) && 
                   (!evaluation.competencyFeedback || Object.keys(evaluation.competencyFeedback).length === 0) && (
                    <div className="text-center py-4">
                      <MessageSquare className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                      <div className="text-sm text-blue-600">No specific feedback provided</div>
                      <div className="text-xs text-blue-500 mt-1">
                        This evaluation was completed without additional comments
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <div className="space-y-2">
              <p className="text-lg font-medium">No evaluations available for this campus</p>
              {campus.name === 'Raigarh' ? (
                <div className="text-sm space-y-1">
                  <p className="text-green-600">This is a new campus that hasn't been evaluated yet.</p>
                  <p>Once resolvers conduct evaluations, the data will appear here.</p>
                </div>
              ) : (
                <p className="text-sm">Evaluation data will appear here once available.</p>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default CampusDetail;