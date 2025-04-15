// src/pages/movement-patterns/sections/RelatedExercisesSection.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import exerciseService, { Exercise } from '../../../api/exerciseService';
import EmptyState from '../../../components/ui/empty-state';

interface RelatedExercisesSectionProps {
  patternId: string;
}

// Mock interface for related exercises - adapt this to your actual API response

const RelatedExercisesSection: React.FC<RelatedExercisesSectionProps> = ({
  patternId,
}) => {
  const { showToast } = useToast();
  const [relatedExercises, setRelatedExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedExercises = async () => {
      setIsLoading(true);
      try {
        // This API call might need to be modified based on your actual API
        // If you don't have this endpoint yet, you can mock it or create it
        const response = await exerciseService.getExercises({
          movement_pattern: patternId, // Assuming this filter works for your API
        });
        setRelatedExercises(response.data || []);
      } catch (error) {
        console.error('Error fetching related exercises:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load related exercises',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedExercises();
  }, [patternId, showToast]);

  // Function to get badge color based on difficulty
  const getDifficultyBadgeClass = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format text fields
  const formatField = (text: string) => {
    return text
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (relatedExercises.length === 0) {
    return (
      <EmptyState
        icon={<Dumbbell className="h-12 w-12 text-gray-400" />}
        title="No related exercises found"
        description="There are no exercises using this movement pattern yet."
      />
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Exercises Using This Movement Pattern
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedExercises.map((exercise) => (
          <Link
            key={exercise.id}
            to={`/exercises/${exercise.id}`}
            className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-md font-medium text-gray-900">
                  {exercise.name}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getDifficultyBadgeClass(exercise.difficulty)}`}
                  >
                    {formatField(exercise.difficulty)}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {formatField(exercise.mechanics)}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      exercise.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : exercise.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {formatField(exercise.status)}
                  </span>
                </div>
                {exercise.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {exercise.description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedExercisesSection;
