// src/components/media/MediaAngleCoverage.tsx
import React, { useMemo } from 'react';
import { Camera, Plus } from 'lucide-react';
import { ExerciseMedia } from '../../api/exerciseMediaService';

interface MediaAngleCoverageProps {
  media: ExerciseMedia[];
  onRequestUpload: (viewAngle: string) => void;
}

interface ViewAngleInfo {
  id: string;
  label: string;
  count: number;
  hasVideo: boolean;
  hasImage: boolean;
  hasSvg: boolean;
}

const MediaAngleCoverage: React.FC<MediaAngleCoverageProps> = ({
  media,
  onRequestUpload,
}) => {
  // Define the recommended view angles with lowercase IDs to match API data
  const angles = useMemo<ViewAngleInfo[]>(() => {
    // First create base angle data
    const baseAngles = [
      { id: 'front', label: 'Front View' },
      { id: 'side', label: 'Side View' },
      { id: 'rear', label: 'Rear View' },
      { id: 'angle', label: '45° Angle View' },
    ];

    // Then compute counts and flags for each angle
    return baseAngles.map((angle) => {
      const angleMedia = media.filter((m) => m.viewAngle === angle.id);

      return {
        id: angle.id,
        label: angle.label,
        count: angleMedia.length,
        hasVideo: angleMedia.some((m) => m.mediaType === 'video'),
        hasImage: angleMedia.some((m) => m.mediaType === 'image'),
        hasSvg: angleMedia.some((m) => m.mediaType === 'svg'),
      };
    });
  }, [media]);

  // Calculate the total coverage percentage
  const coveragePercentage = useMemo(() => {
    const totalAngles = angles.length;
    const coveredAngles = angles.filter((a) => a.count > 0).length;
    return Math.round((coveredAngles / totalAngles) * 100);
  }, [angles]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          View Angle Coverage
        </h3>
        <div className="flex items-center">
          <div
            className="h-2.5 w-16 bg-gray-200 rounded-full mr-2 overflow-hidden"
            title={`${coveragePercentage}% of angles covered`}
          >
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${coveragePercentage}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">{coveragePercentage}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {angles.map((angle) => (
          <div
            key={angle.id}
            className={`border rounded-lg p-3 ${
              angle.count > 0
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-sm">{angle.label}</h4>
              <span
                className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                  angle.count > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {angle.count}
              </span>
            </div>

            {angle.count > 0 ? (
              <div className="flex flex-wrap gap-1 mb-2">
                {angle.hasVideo && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                    Video
                  </span>
                )}
                {angle.hasImage && (
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                    Image
                  </span>
                )}
                {angle.hasSvg && (
                  <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                    SVG
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-2">No media available</p>
            )}

            <button
              onClick={() => onRequestUpload(angle.id)}
              className={`w-full text-xs py-1 rounded flex items-center justify-center ${
                angle.count > 0
                  ? 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <Plus className="h-3 w-3 mr-1" />
              {angle.count > 0 ? 'Add More' : 'Add Media'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaAngleCoverage;
