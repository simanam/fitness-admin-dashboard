// src/components/media/MediaStatistics.tsx
import { useState, useEffect } from 'react';
import {
  BarChart,
  ChevronDown,
  ChevronUp,
  FileVideo,
  Image as ImageIcon,
  FileImage,
} from 'lucide-react';
import {
  exerciseMediaService,
  MediaStats,
} from '../../api/exerciseMediaService';
import { cn } from '../../lib/utils';

interface MediaStatisticsProps {
  exerciseId: string;
  className?: string;
}

const MediaStatistics = ({ exerciseId, className }: MediaStatisticsProps) => {
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch media statistics
  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await exerciseMediaService.getMediaStats(exerciseId);
      setStats(data);
    } catch (err) {
      console.error('Error fetching media statistics:', err);
      setError('Failed to load media statistics');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchStats();
  }, [exerciseId]);

  // Format file size (bytes to MB)
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Show loading state
  if (isLoading && !stats) {
    return (
      <div
        className={cn(
          'animate-pulse space-y-3 p-4 bg-white border rounded-lg',
          className
        )}
      >
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !stats) {
    return (
      <div
        className={cn(
          'p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg',
          className
        )}
      >
        <p>{error}</p>
        <button
          onClick={fetchStats}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // Show empty state
  if (!stats || stats.totalCount === 0) {
    return null; // Hide statistics if no media
  }

  return (
    <div
      className={cn('border rounded-lg overflow-hidden bg-white', className)}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <BarChart className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-900">Media Statistics</h3>
        </div>
        <button className="text-gray-500">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Content (collapsible) */}
      {isExpanded && (
        <div className="p-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Total Count */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Total Media</div>
              <div className="text-2xl font-semibold text-gray-900">
                {stats.totalCount}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <FileVideo className="h-4 w-4 text-purple-500 mx-auto" />
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.byType.VIDEO || 0}
                  </div>
                </div>
                <div className="text-center">
                  <ImageIcon className="h-4 w-4 text-green-500 mx-auto" />
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.byType.IMAGE || 0}
                  </div>
                </div>
                <div className="text-center">
                  <FileImage className="h-4 w-4 text-blue-500 mx-auto" />
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.byType.SVG || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* View Angles */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">View Angles</div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                    <span className="text-xs text-gray-600">Front</span>
                  </div>
                  <div className="font-medium">
                    {stats.byViewAngle.FRONT || 0}
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-xs text-gray-600">Side</span>
                  </div>
                  <div className="font-medium">
                    {stats.byViewAngle.SIDE || 0}
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                    <span className="text-xs text-gray-600">Rear</span>
                  </div>
                  <div className="font-medium">
                    {stats.byViewAngle.REAR || 0}
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
                    <span className="text-xs text-gray-600">Angle</span>
                  </div>
                  <div className="font-medium">
                    {stats.byViewAngle.ANGLE || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Media Details */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Media Details</div>
              <div className="space-y-2 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Total Size</span>
                  <span className="font-medium">
                    {formatFileSize(stats.totalSize)}
                  </span>
                </div>
                {stats.totalDuration > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      Video Duration
                    </span>
                    <span className="font-medium">
                      {stats.totalDuration.toFixed(1)}s
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* View Angle Distribution Visualization */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Media Distribution by View Angle
            </h4>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
              {stats.byViewAngle.FRONT > 0 && (
                <div
                  className="bg-blue-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{
                    width: `${(stats.byViewAngle.FRONT / stats.totalCount) * 100}%`,
                  }}
                >
                  {stats.byViewAngle.FRONT > 1 ? 'Front' : ''}
                </div>
              )}
              {stats.byViewAngle.SIDE > 0 && (
                <div
                  className="bg-green-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{
                    width: `${(stats.byViewAngle.SIDE / stats.totalCount) * 100}%`,
                  }}
                >
                  {stats.byViewAngle.SIDE > 1 ? 'Side' : ''}
                </div>
              )}
              {stats.byViewAngle.REAR > 0 && (
                <div
                  className="bg-purple-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{
                    width: `${(stats.byViewAngle.REAR / stats.totalCount) * 100}%`,
                  }}
                >
                  {stats.byViewAngle.REAR > 1 ? 'Rear' : ''}
                </div>
              )}
              {stats.byViewAngle.ANGLE > 0 && (
                <div
                  className="bg-yellow-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{
                    width: `${(stats.byViewAngle.ANGLE / stats.totalCount) * 100}%`,
                  }}
                >
                  {stats.byViewAngle.ANGLE > 1 ? 'Angle' : ''}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                <span>Front: {stats.byViewAngle.FRONT || 0}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span>Side: {stats.byViewAngle.SIDE || 0}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                <span>Rear: {stats.byViewAngle.REAR || 0}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                <span>Angle: {stats.byViewAngle.ANGLE || 0}</span>
              </div>
            </div>
          </div>

          {/* Media Type Distribution Visualization */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Media Distribution by Type
            </h4>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
              {stats.byType.VIDEO > 0 && (
                <div
                  className="bg-purple-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{
                    width: `${(stats.byType.VIDEO / stats.totalCount) * 100}%`,
                  }}
                >
                  {stats.byType.VIDEO > 1 ? 'Videos' : ''}
                </div>
              )}
              {stats.byType.IMAGE > 0 && (
                <div
                  className="bg-green-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{
                    width: `${(stats.byType.IMAGE / stats.totalCount) * 100}%`,
                  }}
                >
                  {stats.byType.IMAGE > 1 ? 'Images' : ''}
                </div>
              )}
              {stats.byType.SVG > 0 && (
                <div
                  className="bg-blue-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{
                    width: `${(stats.byType.SVG / stats.totalCount) * 100}%`,
                  }}
                >
                  {stats.byType.SVG > 1 ? 'SVGs' : ''}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                <span>Videos: {stats.byType.VIDEO || 0}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span>Images: {stats.byType.IMAGE || 0}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                <span>SVGs: {stats.byType.SVG || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaStatistics;
