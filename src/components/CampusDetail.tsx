import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ArrowLeft, MessageSquare, Calendar, User } from 'lucide-react';
import { Campus, Evaluation } from '../types';

interface CampusDetailProps {
  campus: Campus;
  evaluations: Evaluation[];
  onBack: () => void;
}

const CampusDetail: React.FC<CampusDetailProps> = ({ campus, evaluations, onBack }) => {
  const campusEvaluations = evaluations.filter(evaluation => evaluation.campusId === campus.id);
  
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
            <h1 className="text-2xl font-bold text-gray-900">{campus.name}</h1>
            <p className="text-gray-600">{campus.location}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{campus.averageScore.toFixed(1)}</div>
          <div className="text-sm text-gray-500">Overall Score</div>
        </div>
      </div>

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
            <MessageSquare className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ranking</p>
              <p className="text-2xl font-bold text-gray-900">{campus.ranking}</p>
            </div>
            <div className={`w-8 h-8 rounded-full ${
              campus.ranking === 'High' ? 'bg-green-600' : 
              campus.ranking === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
            }`} />
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
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
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
            <div className="flex items-center justify-center h-64 text-gray-500">
              No evaluation data available
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
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="score" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No resolver scores available
            </div>
          )}
        </div>
      </div>

      {/* Detailed Evaluations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Evaluations</h3>
        </div>
        
        {campusEvaluations.length > 0 ? (
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
                  {evaluation.competencies.map((comp, index) => (
                    <div key={index} className="text-center">
                      <div className="text-sm font-medium text-gray-900">{comp.score}/{comp.maxScore}</div>
                      <div className="text-xs text-gray-500">{comp.category}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(comp.score / comp.maxScore) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Feedback</h5>
                  <p className="text-sm text-gray-700">{evaluation.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No evaluations available for this campus</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusDetail;