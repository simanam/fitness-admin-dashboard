// src/components/media/MediaAngleCoverage.tsx
import { PlusCircle, CheckCircle } from 'lucide-react';
import { ExerciseMedia } from '../../api/exerciseMediaService';
import { cn } from '../../lib/utils';

interface MediaAngleCoverageProps {
  media: ExerciseMedia[];
  onRequestUpload?: (viewAngle: string) => void;
  className?: string;
}

interface AngleData {
  value: string;
  label: string;
  description: string;
  icon: string;
}

const ANGLES: AngleData[] = [
  {
    value: 'FRONT',
    label: 'Front View',
    description:
      'Shows the exercise from the front. Essential for demonstrating proper form and positioning.',
    icon: '👤',
  },
  {
    value: 'SIDE',
    label: 'Side View',
    description:
      'Shows the exercise from the side. Crucial for demonstrating proper joint angles and range of motion.',
    icon: '👤',
  },
  {
    value: 'REAR',
    label: 'Rear View',
    description:
      'Shows the exercise from behind. Important for demonstrating back muscle engagement and positioning.',
    icon: '👤',
  },
  {
    value: 'ANGLE',
    label: 'Angle View',
    description:
      'Shows the exercise from a diagonal perspective. Provides additional context for complex movements.',
    icon: '👤',
  },
];

const MediaAngleCoverage = ({
  media,
  onRequestUpload,
  className,
}: MediaAngleCoverageProps) => {
  // Check which angles are covered
  const getAngleCoverage = () => {
    const coverage = {
      FRONT: false,
      SIDE: false,
      REAR: false,
      ANGLE: false,
    };

    media.forEach((item) => {
      if (item.viewAngle && coverage.hasOwnProperty(item.viewAngle)) {
        coverage[item.viewAngle as keyof typeof coverage] = true;
      }
    });

    return coverage;
  };

  const angleCoverage = getAngleCoverage();

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-base font-medium text-gray-900">
        View Angle Coverage
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {ANGLES.map((angle) => {
          const isCovered =
            angleCoverage[angle.value as keyof typeof angleCoverage];

          return (
            <div
              key={angle.value}
              className={cn(
                'border rounded-lg p-4 relative overflow-hidden',
                isCovered
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              )}
            >
              {/* Status indicator */}
              <div
                className={cn(
                  'absolute top-0 right-0 w-16 h-16 -mt-4 -mr-4 transform rotate-45',
                  isCovered ? 'bg-green-500' : 'bg-gray-300'
                )}
              ></div>

              {/* Content */}
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-2xl">{angle.icon}</div>
                    <h4 className="font-medium text-gray-900 mt-1">
                      {angle.label}
                    </h4>
                  </div>
                  <div className="z-10">
                    {isCovered ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <PlusCircle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-600 mt-2 flex-grow">
                  {angle.description}
                </p>

                {!isCovered && onRequestUpload && (
                  <button
                    onClick={() => onRequestUpload(angle.value)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Add media for this angle
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-500">
        Having media from all angles ensures users can fully understand how to
        perform the exercise correctly.
      </div>
    </div>
  );
};

export default MediaAngleCoverage;
