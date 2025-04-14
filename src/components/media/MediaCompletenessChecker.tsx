// src/components/media/MediaCompletenessChecker.tsx
import React, { useMemo } from 'react';
import { CheckCircle, AlertTriangle, RefreshCw, Info } from 'lucide-react';

// Existing interface
// interface MediaCompletenessCheck {
//   isComplete: boolean;
//   missingAngles: string[];
//   missingTypes: string[];
//   recommendations: string[];
// }

// New interface to match your API response
interface NewCompletenessFormat {
  isComplete: boolean;
  missing?: {
    [mediaType: string]: {
      [angle: string]: number;
    };
  };
}

interface MediaCompletenessCheckerProps {
  exerciseId: string;
  completenessData: NewCompletenessFormat | null;
  isLoading: boolean;
  error: string | null;
  onCheck: () => void;
}

const MediaCompletenessChecker: React.FC<MediaCompletenessCheckerProps> = ({
  completenessData,
  isLoading,
  error,
  onCheck,
}) => {
  // Transform the completeness data to the format the component expects
  const processedData = useMemo(() => {
    if (!completenessData) {
      return {
        isComplete: false,
        missingAngles: [],
        missingTypes: [],
        recommendations: [],
      };
    }

    const missingTypes: string[] = [];
    const missingAngles: string[] = [];
    const recommendations: string[] = [];

    // Extract missing media types and angles
    if (completenessData.missing) {
      for (const [mediaType, angles] of Object.entries(
        completenessData.missing
      )) {
        // Add media type to missing types if not already there
        if (!missingTypes.includes(mediaType.toUpperCase())) {
          missingTypes.push(mediaType.toUpperCase());
        }

        // Add angles to missing angles if not already there
        for (const angle of Object.keys(angles)) {
          if (!missingAngles.includes(angle)) {
            missingAngles.push(angle);
          }
        }

        // Generate recommendations
        for (const angle of Object.keys(angles)) {
          recommendations.push(
            `Add a ${mediaType} from the ${angle} angle to improve exercise demonstration.`
          );
        }
      }
    }

    return {
      isComplete: completenessData.isComplete,
      missingAngles,
      missingTypes,
      recommendations,
    };
  }, [completenessData]);

  // Status icon based on completeness
  const getStatusIcon = () => {
    if (isLoading) {
      return (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
      );
    }

    if (processedData.isComplete) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    if (
      processedData.missingAngles.length === 0 &&
      processedData.missingTypes.length === 0
    ) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  // Status label
  const getStatusLabel = () => {
    if (isLoading) {
      return 'Checking...';
    }

    if (processedData.isComplete) {
      return 'Media complete';
    }

    if (
      processedData.missingAngles.length === 0 &&
      processedData.missingTypes.length === 0
    ) {
      return 'Media sufficient';
    }

    return 'Media incomplete';
  };

  // Get status color
  const getStatusColor = () => {
    if (isLoading) {
      return 'text-gray-500';
    }

    if (processedData.isComplete) {
      return 'text-green-800';
    }

    if (
      processedData.missingAngles.length === 0 &&
      processedData.missingTypes.length === 0
    ) {
      return 'text-green-800';
    }

    return 'text-yellow-800';
  };

  // Function to format angle names for display
  const formatAngleName = (angle: string) => {
    return angle.charAt(0).toUpperCase() + angle.slice(1).toLowerCase();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Media Completeness
        </h3>

        <div className="flex items-center space-x-2">
          <div className={`flex items-center ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-2 text-sm font-medium">{getStatusLabel()}</span>
          </div>

          {!isLoading && (
            <button
              onClick={onCheck}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
              title="Refresh completeness check"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {error}
        </div>
      ) : isLoading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">
            Loading completeness check...
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Missing angles */}
          {processedData.missingAngles.length > 0 && (
            <div className="p-3 bg-yellow-50 rounded-md">
              <h4 className="font-medium text-yellow-800 flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Missing View Angles
              </h4>
              <div className="flex flex-wrap gap-2">
                {processedData.missingAngles.map((angle) => (
                  <span
                    key={angle}
                    className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                  >
                    {formatAngleName(angle)} View
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing media types */}
          {processedData.missingTypes.length > 0 && (
            <div className="p-3 bg-yellow-50 rounded-md">
              <h4 className="font-medium text-yellow-800 flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Missing Media Types
              </h4>
              <div className="flex flex-wrap gap-2">
                {processedData.missingTypes.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                  >
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {processedData.recommendations.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-md">
              <h4 className="font-medium text-blue-800 flex items-center mb-2">
                <Info className="h-4 w-4 mr-2" />
                Recommendations
              </h4>
              <ul className="text-sm text-blue-700 space-y-1 ml-6 list-disc">
                {processedData.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Completeness status */}
          {processedData.isComplete && (
            <div className="p-3 bg-green-50 rounded-md">
              <h4 className="font-medium text-green-800 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                All required media is present
              </h4>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaCompletenessChecker;
