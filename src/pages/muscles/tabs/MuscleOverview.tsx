// src/pages/muscles/tabs/MuscleOverview.tsx
import { useState, useEffect } from 'react';
import { Info, Layers, Calendar } from 'lucide-react';
import type { Muscle } from '../../../api/muscleService';
import apiClient from '../../../api/client';

interface ExtendedMuscle extends Muscle {
  createdAt?: string;
  updatedAt?: string;
}

interface MuscleOverviewProps {
  muscle: ExtendedMuscle;
}

const MuscleOverview: React.FC<MuscleOverviewProps> = ({ muscle }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoadingSvg, setIsLoadingSvg] = useState(false);
  const [svgError, setSvgError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSvg = async () => {
      if (!muscle.id) return;

      setIsLoadingSvg(true);
      setSvgError(null);

      try {
        const response = await apiClient.get(`/muscles/${muscle.id}/svg`);

        if (response.data) {
          // Store the SVG content directly
          setSvgContent(response.data);
        } else {
          setSvgContent(null);
        }
      } catch (error) {
        console.error('Error fetching muscle SVG:', error);
        setSvgError('Failed to load muscle visualization');
        setSvgContent(null);
      } finally {
        setIsLoadingSvg(false);
      }
    };

    fetchSvg();
  }, [muscle.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Function to process SVG to ensure it scales properly
  const processedSvg = () => {
    if (!svgContent) return null;

    // Add preserveAspectRatio and width/height if not present
    let processedContent = svgContent;

    // If the SVG doesn't have width/height set to 100%, add it
    // This is a simple string replacement - we're looking for the opening SVG tag
    // and adding width="100%" height="100%" if not present
    if (!processedContent.includes('width="100%"')) {
      processedContent = processedContent.replace(
        '<svg',
        '<svg width="100%" height="100%"'
      );
    }

    // Ensure preserveAspectRatio is set correctly
    if (!processedContent.includes('preserveAspectRatio')) {
      processedContent = processedContent.replace(
        '<svg',
        '<svg preserveAspectRatio="xMidYMid meet"'
      );
    }

    return processedContent;
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Info className="h-5 w-5 mr-2 text-gray-500" />
          Description
        </h3>
        {muscle.description ? (
          <div className="prose max-w-none">
            <p className="text-gray-700">{muscle.description}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No description provided.</p>
        )}
      </div>

      {/* Muscle Group Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Layers className="h-5 w-5 mr-2 text-gray-500" />
          Muscle Group Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Group</h4>
            <p className="text-gray-900">
              {muscle.muscleGroup?.name || 'None'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
            <p className="text-gray-900">
              {muscle.muscleGroup?.category.replace('_', ' ') || 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-gray-500" />
          Metadata
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-gray-900">
                {muscle.createdAt ? formatDate(muscle.createdAt) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-gray-900">
                {muscle.updatedAt ? formatDate(muscle.updatedAt) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Visualization */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Layers className="h-5 w-5 mr-2 text-gray-500" />
          Muscle Visualization
        </h3>

        <div className="border border-gray-200 rounded-lg bg-gray-50 p-4">
          <div className="aspect-square max-w-md mx-auto">
            {isLoadingSvg ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-2" />
                <p>Loading visualization...</p>
              </div>
            ) : svgContent ? (
              <div className="flex items-center justify-center h-full">
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: processedSvg() || '' }}
                />
              </div>
            ) : svgError ? (
              <div className="text-center text-red-500 h-full flex items-center justify-center">
                <p>{svgError}</p>
              </div>
            ) : (
              <div className="text-center text-gray-500 h-full flex flex-col items-center justify-center">
                <Layers className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No visualization available</p>
                <p className="text-sm mt-1">
                  SVG data not found for this muscle
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuscleOverview;
