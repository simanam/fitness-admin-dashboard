// src/components/media/MediaCompletenessChecker.tsx
import { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  exerciseMediaService,
  MediaCompletenessCheck,
} from '../../api/exerciseMediaService';
import { cn } from '../../lib/utils';

interface MediaCompletenessCheckerProps {
  exerciseId: string;
  onCheck?: () => void;
  className?: string;
}

const MediaCompletenessChecker = ({
  exerciseId,
  onCheck,
  className,
}: MediaCompletenessCheckerProps) => {
  const [completenessData, setCompletenessData] =
    useState<MediaCompletenessCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch media completeness data
  const checkCompleteness = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data =
        await exerciseMediaService.checkMediaCompleteness(exerciseId);
      setCompletenessData(data);
      if (onCheck) onCheck();
    } catch (err) {
      console.error('Error checking media completeness:', err);
      setError('Failed to check media completeness');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    checkCompleteness();
  }, [exerciseId]);

  // Determine status color and icon
  const getStatusInfo = () => {
    if (!completenessData) {
      return {
        color: 'bg-gray-100 text-gray-800',
        icon: <Info className="h-5 w-5" />,
        text: 'Checking media completeness...',
      };
    }

    if (completenessData.isComplete) {
      return {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-5 w-5" />,
        text: 'Media is complete',
      };
    }

    return {
      color: 'bg-yellow-100 text-yellow-800',
      icon: <AlertTriangle className="h-5 w-5" />,
      text: 'Media is incomplete',
    };
  };

  const statusInfo = getStatusInfo();

  // Show loading state
  if (isLoading && !completenessData) {
    return (
      <div
        className={cn('animate-pulse p-4 rounded-lg bg-gray-100', className)}
      >
        <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  // Show error state
  if (error && !completenessData) {
    return (
      <div className={cn('p-4 rounded-lg bg-red-50 text-red-800', className)}>
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>Error checking media completeness</span>
        </div>
        <button
          onClick={checkCompleteness}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-4 cursor-pointer',
          statusInfo.color
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <span className="mr-2">{statusInfo.icon}</span>
          <span className="font-medium">{statusInfo.text}</span>
        </div>
        <button className="text-gray-700">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Details section (collapsible) */}
      {isExpanded && completenessData && (
        <div className="p-4 bg-white">
          {completenessData.isComplete ? (
            <p className="text-gray-700">
              All required media assets are available for this exercise. Having
              media from multiple angles and different types helps users better
              understand the exercise.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Missing angles */}
              {completenessData.missingAngles.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Missing View Angles:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {completenessData.missingAngles.map((angle) => (
                      <span
                        key={angle}
                        className="bg-yellow-50 text-yellow-800 px-2 py-1 text-xs rounded-full"
                      >
                        {angle}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing types */}
              {completenessData.missingTypes.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Missing Media Types:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {completenessData.missingTypes.map((type) => (
                      <span
                        key={type}
                        className="bg-yellow-50 text-yellow-800 px-2 py-1 text-xs rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {completenessData.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Recommendations:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {completenessData.recommendations.map(
                      (recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

              <button
                onClick={checkCompleteness}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-2"
              >
                <Info className="h-4 w-4 mr-1" />
                Refresh check
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaCompletenessChecker;
