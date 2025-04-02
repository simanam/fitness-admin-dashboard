// src/pages/muscles/tabs/MuscleExercises.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import MuscleExercisesTable from '../components/MuscleExercisesTable';
import EmptyState from '../../../components/ui/empty-state';
import Pagination from '../../../components/ui/pagination';
import muscleExerciseService, {
  ExerciseWithMuscleDetails,
} from '../../../api/muscleExerciseService';

interface MuscleExercisesProps {
  muscleId: string;
}

// Updated to match your actual stats data structure
interface MuscleExerciseStats {
  totalExercises: number;
  primaryCount: number;
  secondaryCount: number;
  averageActivation: number;
}

const MuscleExercises: React.FC<MuscleExercisesProps> = ({ muscleId }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [exercises, setExercises] = useState<ExerciseWithMuscleDetails[]>([]);
  const [stats, setStats] = useState<MuscleExerciseStats>({
    totalExercises: 0,
    primaryCount: 0,
    secondaryCount: 0,
    averageActivation: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Using useCallback to prevent the function from being recreated on each render
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // For fetching exercises
      const exercisesResponse =
        await muscleExerciseService.getExercisesByMuscle(muscleId, {
          page: currentPage,
          per_page: 10,
        });

      // Handle the case where the response structure might be different
      if (exercisesResponse && Array.isArray(exercisesResponse.data)) {
        setExercises(exercisesResponse.data);

        // Safely access pagination metadata
        if (exercisesResponse.meta) {
          setTotalPages(exercisesResponse.meta.totalPages || 1);
          setTotalItems(
            exercisesResponse.meta.total || exercisesResponse.data.length
          );
        } else {
          // Fallback if meta is not available
          setTotalPages(1);
          setTotalItems(exercisesResponse.data.length);
        }
      } else if (exercisesResponse && Array.isArray(exercisesResponse)) {
        // Handle case where response might be the array directly
        setExercises(exercisesResponse);
        setTotalPages(1);
        setTotalItems(exercisesResponse.length);
      } else {
        // Set empty state if response is unexpected
        setExercises([]);
        setTotalPages(1);
        setTotalItems(0);
      }

      // For fetching stats
      try {
        const statsResponse =
          await muscleExerciseService.getMuscleExerciseStats(muscleId);
        // Check if statsResponse has the expected structure
        if (statsResponse && typeof statsResponse === 'object') {
          setStats({
            totalExercises: statsResponse.totalExercises || 0,
            primaryCount: statsResponse.primaryCount || 0,
            secondaryCount: statsResponse.secondaryCount || 0,
            averageActivation: statsResponse.averageActivation || 0,
          });
        }
      } catch (statsError) {
        console.error('Error fetching stats:', statsError);
        // Don't show toast for stats error, just keep default values
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load related exercises',
      });
      // Set empty state on error
      setExercises([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [muscleId, currentPage, showToast]); // Include dependencies

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Only depend on the fetchData function

  // Handler for viewing exercise details - wrapped in useCallback
  const handleViewExercise = useCallback(
    (exercise: ExerciseWithMuscleDetails) => {
      navigate(`/exercises/${exercise.exercise?.id || exercise.exerciseId}`);
    },
    [navigate]
  );

  return (
    <div className="space-y-6">
      {/* Stats summary - Updated to match the actual data structure */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900">Primary Target</h4>
          <p className="mt-1 text-2xl font-semibold text-blue-600">
            {stats.primaryCount}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900">
            Secondary Target
          </h4>
          <p className="mt-1 text-2xl font-semibold text-purple-600">
            {stats.secondaryCount}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900">Avg. Activation</h4>
          <p className="mt-1 text-2xl font-semibold text-gray-600">
            {stats.averageActivation}%
          </p>
        </div>
      </div>

      {/* Exercises table - using the specialized component */}
      <MuscleExercisesTable
        data={exercises}
        isLoading={isLoading}
        onRowClick={handleViewExercise}
        emptyState={
          <EmptyState
            icon={<Dumbbell size={36} className="text-gray-400" />}
            title="No related exercises"
            description="This muscle is not targeted by any exercises yet."
          />
        }
        keyExtractor={(item) =>
          item.id || `${item.exerciseId}-${item.muscleId}`
        }
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {exercises.length} of {totalItems} exercises
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default MuscleExercises;
