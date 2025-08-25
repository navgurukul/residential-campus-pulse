import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Trash2, Download, Upload, Info, Clock, HardDrive } from 'lucide-react';
import { LocalStorageManager } from '../utils/localStorage';
import { getCacheStatus, refreshCampusData } from '../utils/apiUtils';

interface CacheManagerProps {
  onDataRefresh?: () => void;
}

const CacheManager: React.FC<CacheManagerProps> = ({ onDataRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const updateCacheInfo = () => {
    const storageInfo = LocalStorageManager.getStorageInfo();
    const status = getCacheStatus();
    
    setCacheInfo({
      ...storageInfo,
      ...status,
      urgentIssuesCount: LocalStorageManager.getUrgentIssues().length
    });
  };

  useEffect(() => {
    if (isOpen) {
      updateCacheInfo();
    }
  }, [isOpen]);

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      await refreshCampusData();
      updateCacheInfo();
      onDataRefresh?.();
      console.log('✅ Data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear all cached data? This will require a fresh data fetch.')) {
      LocalStorageManager.clearAllData();
      updateCacheInfo();
      onDataRefresh?.();
      console.log('🗑️ All cache cleared');
    }
  };

  const handleExportData = () => {
    try {
      const exportData = LocalStorageManager.exportData();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campus-pulse-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('📥 Data exported successfully');
    } catch (error) {
      console.error('❌ Failed to export data:', error);
      alert('Failed to export data');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = LocalStorageManager.importData(jsonData);
        if (success) {
          updateCacheInfo();
          onDataRefresh?.();
          alert('Data imported successfully!');
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      } catch (error) {
        console.error('❌ Failed to import data:', error);
        alert('Failed to import data');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-40"
        title="Cache Manager"
      >
        <Database className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Database className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Cache Manager</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {cacheInfo && (
        <div className="space-y-4">
          {/* Cache Status */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Cache Status</span>
              <div className={`w-2 h-2 rounded-full ${cacheInfo.isValid ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Size:</span>
                <span>{formatBytes(cacheInfo.totalSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>Age:</span>
                <span>{formatDuration(cacheInfo.ageMinutes)}</span>
              </div>
              <div className="flex justify-between">
                <span>Urgent Issues:</span>
                <span>{cacheInfo.urgentIssuesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={cacheInfo.isValid ? 'text-green-600' : 'text-yellow-600'}>
                  {cacheInfo.isValid ? 'Valid' : 'Stale'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleRefreshData}
              disabled={loading}
              className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>

              <label className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer text-sm">
                <Upload className="w-4 h-4 mr-1" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={handleClearCache}
              className="w-full flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache
            </button>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Info className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">Shortcuts</span>
            </div>
            <div className="space-y-1 text-xs text-blue-700">
              <div>Ctrl+Shift+R: Refresh data</div>
              <div>Ctrl+Shift+C: Clear cache</div>
              <div>Ctrl+Shift+I: Cache info</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CacheManager;