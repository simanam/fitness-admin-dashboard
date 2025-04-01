// src/components/media/MediaStatistics.tsx
import React, { useMemo } from 'react';
import { FileVideo, Image as ImageIcon, FileUp, RefreshCw } from 'lucide-react';

// Original interface expected by the component
interface MediaStats {
  totalCount: number;
  byType: {
    VIDEO: number;
    IMAGE: number;
    SVG: number;
  };
  byViewAngle: {
    FRONT: number;
    SIDE: number;
    BACK: number; // Changed from REAR to BACK
    DIAGONAL: number; // Changed from ANGLE to DIAGONAL
    FORTYFIVE: number; // Added this for 45-degree
  };
  totalDuration: number;
  totalSize: number;
}

// New interface that matches your API response
interface NewMediaStatsFormat {
  video: {
    count: number;
    totalDuration: number;
    totalSize: number;
    countByAngle: {
      [key: string]: number;
    };
    hasPrimary: boolean;
  };
  image: {
    count: number;
    totalSize: number;
    countByAngle: {
      [key: string]: number;
    };
    hasPrimary: boolean;
  };
  svg?: {
    count: number;
    totalSize: number;
    countByAngle: {
      [key: string]: number;
    };
    hasPrimary: boolean;
  };
}

interface MediaStatisticsProps {
  exerciseId: string;
  statsData: NewMediaStatsFormat | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const defaultStats: MediaStats = {
  totalCount: 0,
  byType: {
    VIDEO: 0,
    IMAGE: 0,
    SVG: 0,
  },
  byViewAngle: {
    FRONT: 0,
    SIDE: 0,
    REAR: 0,
    ANGLE: 0,
  },
  totalDuration: 0,
  totalSize: 0,
};

const MediaStatistics: React.FC<MediaStatisticsProps> = ({
  exerciseId,
  statsData,
  isLoading,
  error,
  onRefresh,
}) => {
  // Transform the new format to the expected format
  const stats = useMemo(() => {
    if (!statsData) return defaultStats;

    // Initialize the transformed stats object
    const transformedStats: MediaStats = {
      totalCount: 0,
      byType: {
        VIDEO: statsData.video?.count || 0,
        IMAGE: statsData.image?.count || 0,
        SVG: statsData.svg?.count || 0,
      },
      byViewAngle: {
        FRONT: 0,
        SIDE: 0,
        REAR: 0,
        ANGLE: 0,
      },
      totalDuration: statsData.video?.totalDuration || 0,
      totalSize:
        (statsData.video?.totalSize || 0) +
        (statsData.image?.totalSize || 0) +
        (statsData.svg?.totalSize || 0),
    };

    // Calculate totalCount
    transformedStats.totalCount =
      transformedStats.byType.VIDEO +
      transformedStats.byType.IMAGE +
      transformedStats.byType.SVG;

    // Process angles for videos
    if (statsData.video?.countByAngle) {
      for (const [angle, count] of Object.entries(
        statsData.video.countByAngle
      )) {
        const upperAngle = angle.toUpperCase();
        transformedStats.byViewAngle[upperAngle] =
          (transformedStats.byViewAngle[upperAngle] || 0) + count;
      }
    }

    // Process angles for images
    if (statsData.image?.countByAngle) {
      for (const [angle, count] of Object.entries(
        statsData.image.countByAngle
      )) {
        const upperAngle = angle.toUpperCase();
        transformedStats.byViewAngle[upperAngle] =
          (transformedStats.byViewAngle[upperAngle] || 0) + count;
      }
    }

    // Process angles for SVGs if they exist
    if (statsData.svg?.countByAngle) {
      for (const [angle, count] of Object.entries(statsData.svg.countByAngle)) {
        const upperAngle = angle.toUpperCase();
        transformedStats.byViewAngle[upperAngle] =
          (transformedStats.byViewAngle[upperAngle] || 0) + count;
      }
    }

    return transformedStats;
  }, [statsData]);

  // Always safely access properties using optional chaining
  const videoCount = stats?.byType?.VIDEO ?? 0;
  const imageCount = stats?.byType?.IMAGE ?? 0;
  const svgCount = stats?.byType?.SVG ?? 0;

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Media Statistics</h3>
        {!isLoading && (
          <button
            onClick={onRefresh}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
            title="Refresh statistics"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>

      {error ? (
        <div className="text-red-600 text-sm mb-4 p-2 bg-red-50 rounded-md">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Media Types</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileVideo className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm">Videos</span>
                  </div>
                  <span className="text-sm font-medium">{videoCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ImageIcon className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Images</span>
                  </div>
                  <span className="text-sm font-medium">{imageCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileUp className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm">SVGs</span>
                  </div>
                  <span className="text-sm font-medium">{svgCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">View Angles</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Front View</span>
                  <span className="text-sm font-medium">
                    {stats?.byViewAngle?.FRONT ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Side View</span>
                  <span className="text-sm font-medium">
                    {stats?.byViewAngle?.SIDE ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Back View</span>
                  <span className="text-sm font-medium">
                    {stats?.byViewAngle?.BACK ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Diagonal View</span>
                  <span className="text-sm font-medium">
                    {stats?.byViewAngle?.DIAGONAL ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">45° Angle View</span>
                  <span className="text-sm font-medium">
                    {stats?.byViewAngle?.FORTYFIVE ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-600">Total Duration</div>
              <div className="font-medium">
                {formatDuration(stats?.totalDuration ?? 0)}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-600">Total Size</div>
              <div className="font-medium">
                {formatSize(stats?.totalSize ?? 0)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MediaStatistics;
