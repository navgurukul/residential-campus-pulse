import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ArrowLeft, MessageSquare, Calendar, User, Download, FileText, TrendingUp, Award, AlertCircle, Users, UserCheck } from 'lucide-react';
import { Campus, Evaluation } from '../types';
import { competencyCategories } from '../data/mockData';
import { exportToPDF, exportToCSV, prepareCampusDetailDataForExport } from '../utils/exportUtils';
import { getCampusPOCs, hasPOCConfig } from '../data/campusPOCs';

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

interface CampusDetailProps {
  campus: Campus;
  evaluations: Evaluation[];
  onBack: () => void;
}

const CampusDetail: React.FC<CampusDetailProps> = ({ campus, evaluations, onBack }) => {
  // Safety checks to prevent crashes
  if (!campus) {
    return <div className="flex items-center justify-center h-64">Campus not found</div>;
  }
  
  if (!evaluations || !Array.isArray(evaluations)) {
    return <div className="flex items-center justify-center h-64">Loading evaluation data...</div>;
  }

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
  
  // Helper function to shorten category names for radar chart
  const shortenCategoryName = (category: string): string => {
    const shortNames: { [key: string]: string } = {
      'Vipassana': 'Vipassana',
      'Nutrition Supplementation + Yoga/Weight Training': 'Nutrition + Yoga',
      'Houses and Reward Systems': 'Houses & Rewards',
      'Etiocracy, Co-Creation & Ownership': 'Etiocracy & Ownership',
      'Campus interactions': 'Campus Interactions',
      'Gratitude': 'Gratitude',
      'Hackathons': 'Hackathons',
      'English Communication & Comprehension': 'English Comm.',
      'Learning Environment & Peer Support': 'Learning Environment',
      'Process Principles Understanding & Implementation': 'Process Principles',
      'Life Skills Implementation': 'Life Skills'
    };
    return shortNames[category] || category;
  };

  // Prepare radar chart data - calculate average scores across all evaluations
  const radarData = campusEvaluations.length > 0 
    ? competencyCategories.map(category => {
        // Get all scores for this competency across all evaluations
        const competencyScores = campusEvaluations
          .flatMap(evaluation => evaluation.competencies)
          .filter(comp => comp.category === category)
          .map(comp => comp.score);
        
        // Calculate average score for this competency
        const averageScore = competencyScores.length > 0 
          ? competencyScores.reduce((sum, score) => sum + score, 0) / competencyScores.length
          : 0;
        
        return {
          category: shortenCategoryName(category),
          score: Number(averageScore.toFixed(1)),
          maxScore: 7
        };
      })
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
              {hasNoEvaluations && (
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  No Evaluations Yet
                </span>
              )}
            </div>
            <p className="text-gray-600">{campus.location}</p>
            {campus.status === 'Relocated' && (
              <p className="text-sm text-orange-600 mt-1">
                This campus has been relocated. Historical evaluation data is preserved below.
              </p>
            )}
            {hasNoEvaluations && (
              <p className="text-sm text-gray-600 mt-1">
                No evaluations have been conducted yet for this campus.
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
            <div className="text-sm text-gray-500">Latest Score</div>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Competency Analysis</h3>
            {hasPOCConfig(campus.name) && (
              <div className="flex items-center space-x-1 text-xs text-blue-600">
                <UserCheck className="w-4 h-4" />
                <span>POCs below</span>
              </div>
            )}
          </div>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData} margin={{ top: 40, right: 80, bottom: 40, left: 80 }}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  className="text-xs"
                />
                <PolarRadiusAxis angle={90} domain={[0, 7]} tick={{ fontSize: 10 }} tickCount={8} />
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
                {hasNoEvaluations && (
                  <p className="text-sm mt-1">This campus hasn't been evaluated yet</p>
                )}
              </div>
            </div>
          )}
          
          {/* POC Information - Integrated below chart */}
          {hasPOCConfig(campus.name) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-semibold text-gray-900">Competency Points of Contact</h4>
              </div>
              <div className="space-y-3">
                {getCampusPOCs(campus.name).map((poc, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white font-semibold text-xs">
                          {poc.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900 text-sm">{poc.name}</h5>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {poc.competencies.map((comp, compIndex) => (
                            <span 
                              key={compIndex} 
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-blue-700 border border-blue-200"
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500 italic">
                💡 Contact these team members for competency-specific queries
              </p>
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
                <YAxis domain={[0, 7]} ticks={[0, 1, 2, 3, 4, 5, 6, 7]} />
                <Tooltip />
                <Bar dataKey="score" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <User className="w-12 h-12 mb-3 opacity-50" />
              <div className="text-center">
                <p className="font-medium">No resolver scores available</p>
                {hasNoEvaluations && (
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
                    <div className="text-xs text-gray-500">Latest Score</div>
                  </div>
                </div>
                
                {/* Beautiful Competency Cards */}
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                    Competency Assessment
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evaluation.competencies.map((comp, index) => {
                      const getLevelStyling = (level: string) => {
                        if (level?.includes('7') || level?.includes('6')) return {
                          bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
                          border: 'border-emerald-200',
                          dot: 'bg-emerald-500',
                          text: 'text-emerald-700'
                        };
                        if (level?.includes('5') || level?.includes('4')) return {
                          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
                          border: 'border-blue-200',
                          dot: 'bg-blue-500',
                          text: 'text-blue-700'
                        };
                        if (level?.includes('3') || level?.includes('2')) return {
                          bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
                          border: 'border-amber-200',
                          dot: 'bg-amber-500',
                          text: 'text-amber-700'
                        };
                        if (level?.includes('1')) return {
                          bg: 'bg-gradient-to-r from-orange-50 to-red-50',
                          border: 'border-orange-200',
                          dot: 'bg-orange-500',
                          text: 'text-orange-700'
                        };
                        return {
                          bg: 'bg-gradient-to-r from-red-50 to-pink-50',
                          border: 'border-red-200',
                          dot: 'bg-red-500',
                          text: 'text-red-700'
                        };
                      };
                      
                      const styling = getLevelStyling(comp.level);
                      
                      return (
                        <div key={index} className={`${styling.bg} ${styling.border} border rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 pr-4">
                              <h5 className="font-semibold text-gray-800 text-sm leading-snug mb-2">
                                {comp.category}
                              </h5>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${styling.dot}`}></div>
                                <span className={`text-xs font-medium ${styling.text}`}>
                                  {comp.level ? comp.level : `Level ${Math.round(comp.score)}`}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-800">
                                {comp.score}
                              </div>
                              <div className="text-xs text-gray-500">
                                / {comp.maxScore}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Collapsible Detailed Feedback Section */}
                <details className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <summary className="cursor-pointer p-4 hover:bg-blue-100 rounded-lg transition-colors">
                    <span className="text-sm font-semibold text-blue-900 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Detailed Feedback & Comments
                      <span className="ml-2 text-xs text-blue-600">(Click to expand)</span>
                    </span>
                  </summary>
                  <div className="p-4 pt-0">
                  
                  {/* General Feedback */}
                  {evaluation.feedback && !evaluation.feedback.includes('Comprehensive evaluation') && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-blue-700 mb-1 bg-blue-100 px-2 py-1 rounded inline-block">
                        General Feedback
                      </div>
                      <div className="text-sm text-gray-700 bg-white p-3 rounded border-l-4 border-blue-400 mt-1">
                        {parseMarkdown(evaluation.feedback)}
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
                                <div className="text-sm text-gray-700 ml-4">{parseMarkdown(feedback)}</div>
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
                </details>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <div className="space-y-2">
              <p className="text-lg font-medium">No evaluations available for this campus</p>
              {hasNoEvaluations ? (
                <div className="text-sm space-y-1">
                  <p className="text-gray-600">This campus hasn't been evaluated yet.</p>
                  <p>Once resolvers conduct evaluations, the data will appear here.</p>
                </div>
              ) : (
                <p className="text-sm">Evaluation data will appear here once available.</p>
              )}
            </div>
          </div>
        )}
        </div>

        {/* Campus-Specific Analytics Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            {campus.name} - Detailed Analytics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Analytics Cards */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Evaluations</p>
                  <p className="text-lg font-bold text-blue-900">{campusEvaluations.length}</p>
                  <p className="text-xs text-blue-600">
                    {campusEvaluations.length > 1 ? 'Multiple assessments' : 'Single assessment'}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Strongest Competency</p>
                  <p className="text-lg font-bold text-green-900">
                    {campusEvaluations.length > 0 ? 
                      campusEvaluations[0].competencies.reduce((prev, current) => 
                        (prev.score > current.score) ? prev : current
                      ).score.toFixed(1) : 'N/A'
                    }
                  </p>
                  <p className="text-xs text-green-600">
                    {campusEvaluations.length > 0 ? 
                      shortenCategoryName(campusEvaluations[0].competencies.reduce((prev, current) => 
                        (prev.score > current.score) ? prev : current
                      ).category) : 'No data'
                    }
                  </p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Improvement Area</p>
                  <p className="text-lg font-bold text-orange-900">
                    {campusEvaluations.length > 0 ? 
                      campusEvaluations[0].competencies.reduce((prev, current) => 
                        (prev.score < current.score) ? prev : current
                      ).score.toFixed(1) : 'N/A'
                    }
                  </p>
                  <p className="text-xs text-orange-600">
                    {campusEvaluations.length > 0 ? 
                      shortenCategoryName(campusEvaluations[0].competencies.reduce((prev, current) => 
                        (prev.score < current.score) ? prev : current
                      ).category) : 'No data'
                    }
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Evaluator Count</p>
                  <p className="text-lg font-bold text-purple-900">{campus.totalResolvers}</p>
                  <p className="text-xs text-purple-600">
                    {campus.totalResolvers > 5 ? 'Well evaluated' : 'Needs more evaluators'}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Competency Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Competency Performance Analysis</h4>
              {campusEvaluations.length > 0 ? (
                <div className="space-y-3">
                  {campusEvaluations[0].competencies
                    .sort((a, b) => b.score - a.score)
                    .map((comp, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 flex-1 mr-2">
                          {shortenCategoryName(comp.category)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                comp.score >= 6 ? 'bg-green-500' :
                                comp.score >= 4 ? 'bg-blue-500' :
                                comp.score >= 2 ? 'bg-yellow-500' :
                                comp.score >= 1 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(comp.score / comp.maxScore) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12">{comp.score.toFixed(1)}/7</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No competency data available</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Campus Insights</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Campus Level</span>
                  <span className={`text-lg font-bold ${campusLevel.color}`}>
                    {campusLevel.level}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Last Evaluation</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(campus.lastEvaluated).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Campus Status</span>
                  <span className={`text-sm font-medium ${
                    campus.status === 'Active' ? 'text-green-600' :
                    campus.status === 'Relocated' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {campus.status}
                    {campus.relocatedTo && ` → ${campus.relocatedTo}`}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Score vs Network Avg</span>
                  <span className={`text-lg font-bold ${
                    campus.averageScore > 4 ? 'text-green-600' : 
                    campus.averageScore > 2 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {campus.averageScore > 4 ? '+' : ''}{(campus.averageScore - 4).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Recommended Actions for {campus.name}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-2">🎯 Priority Focus</h5>
                <p className="text-sm text-gray-600">
                  {campusEvaluations.length > 0 ? (
                    `Focus on improving ${shortenCategoryName(campusEvaluations[0].competencies.reduce((prev, current) => 
                      (prev.score < current.score) ? prev : current
                    ).category)} (currently ${campusEvaluations[0].competencies.reduce((prev, current) => 
                      (prev.score < current.score) ? prev : current
                    ).score.toFixed(1)}/7)`
                  ) : (
                    'Schedule comprehensive evaluation to identify focus areas'
                  )}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-2">📈 Growth Opportunity</h5>
                <p className="text-sm text-gray-600">
                  {campus.totalResolvers < 5 ? 
                    `Increase evaluator participation (currently ${campus.totalResolvers} evaluators)` :
                    'Maintain current evaluation frequency and focus on implementation'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusDetail;