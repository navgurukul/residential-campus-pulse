import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, User, Mail, Calendar, RefreshCw } from 'lucide-react';

interface UrgentIssue {
  id: string;
  campusName: string;
  resolverName: string;
  dateEvaluated: string;
  issue: string;
  type: 'urgent' | 'escalation';
}

interface UrgentIssuesData {
  urgentIssues: UrgentIssue[];
  escalationIssues: UrgentIssue[];
  totalUrgent: number;
  totalEscalation: number;
  lastUpdated: string | null;
}

const UrgentIssues: React.FC = () => {
  const [data, setData] = useState<UrgentIssuesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<UrgentIssue | null>(null);

  const fetchUrgentIssues = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://ng-campus-pulse.onrender.com/api/urgent-issues');
      if (!response.ok) {
        throw new Error('Failed to fetch urgent issues');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrgentIssues();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-gray-600">Loading urgent issues...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Error: {error}</span>
        </div>
        <button
          onClick={fetchUrgentIssues}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <div className="text-gray-500">No urgent issues data available</div>
      </div>
    );
  }

  const allIssues = [...data.urgentIssues, ...data.escalationIssues].sort(
    (a, b) => new Date(b.dateEvaluated).getTime() - new Date(a.dateEvaluated).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Urgent Campus Issues</h2>
          <p className="text-gray-600 mt-1">Issues requiring immediate attention and escalation</p>
        </div>
        <button
          onClick={fetchUrgentIssues}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent Issues</p>
              <p className="text-3xl font-bold text-orange-600">{data.totalUrgent}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Escalation Required</p>
              <p className="text-3xl font-bold text-red-600">{data.totalEscalation}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Issues</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalUrgent + data.totalEscalation}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Mail className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {allIssues.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Urgent Issues</h3>
          <p className="text-gray-500">Great news! No urgent issues have been reported recently.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Issues</h3>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Never'}
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {allIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedIssue(issue)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
                        issue.type === 'escalation' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {issue.type === 'escalation' ? (
                          <>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Escalation Required
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Urgent Attention
                          </>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(issue.dateEvaluated).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="font-medium">{issue.campusName}</span>
                      <span className="mx-2">•</span>
                      <User className="w-4 h-4 mr-1" />
                      <span>{issue.resolverName}</span>
                    </div>
                    
                    <p className="text-gray-900 line-clamp-2">
                      {issue.issue.length > 150 
                        ? `${issue.issue.substring(0, 150)}...` 
                        : issue.issue
                      }
                    </p>
                  </div>
                  
                  <div className="ml-4">
                    <div className={`w-3 h-3 rounded-full ${
                      issue.type === 'escalation' ? 'bg-red-500' : 'bg-orange-500'
                    }`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className={`p-6 border-b border-gray-200 ${
              selectedIssue.type === 'escalation' 
                ? 'bg-gradient-to-r from-red-50 to-red-100' 
                : 'bg-gradient-to-r from-orange-50 to-orange-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {selectedIssue.type === 'escalation' ? (
                    <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                  ) : (
                    <Clock className="w-6 h-6 text-orange-600 mr-3" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedIssue.type === 'escalation' ? 'Escalation Required' : 'Urgent Issue'}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedIssue.campusName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Campus</label>
                    <div className="flex items-center mt-1">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{selectedIssue.campusName}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reported By</label>
                    <div className="flex items-center mt-1">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{selectedIssue.resolverName}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Reported</label>
                    <div className="flex items-center mt-1">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {new Date(selectedIssue.dateEvaluated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      selectedIssue.type === 'escalation' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedIssue.type === 'escalation' ? 'High Priority' : 'Medium Priority'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Issue Description</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedIssue.issue}</p>
                  </div>
                </div>

                {selectedIssue.type === 'escalation' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-red-800 font-medium">Email Notification Sent</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      This issue has been automatically emailed to surajsahani@navgurukul.org for immediate attention.
                    </p>
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

export default UrgentIssues;