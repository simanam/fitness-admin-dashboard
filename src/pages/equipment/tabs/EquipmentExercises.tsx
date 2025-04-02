// src/pages/equipment/tabs/EquipmentExercises.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Dumbbell } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import DataTable, { Column } from '../../../components/common/DataTable';
import EmptyState from '../../../components/ui/empty-state';
import Pagination from '../../../components/ui/pagination';
import equipmentExerciseService, {
  ExerciseWithEquipmentDetails,
} from '../../../api/equipmentExerciseService';

interface EquipmentExercisesProps {
  equipmentId: string;
}

// Updated to match your actual stats data structure
interface EquipmentExerciseStats {
  totalExercises: number;
  requiredCount: number;
  optionalCount: number;
}

const EquipmentExercises: React.FC<EquipmentExercisesProps> = ({
  equipmentId,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [exercises, setExercises] = useState<ExerciseWithEquipmentDetails[]>(
    []
  );
  const [stats, setStats] = useState<EquipmentExerciseStats>({
    totalExercises: 0,
    requiredCount: 0,
    optionalCount: 0,
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
        await equipmentExerciseService.getExercisesByEquipment(equipmentId, {
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
          await equipmentExerciseService.getEquipmentExerciseStats(equipmentId);
        // Check if statsResponse has the expected structure
        if (statsResponse && typeof statsResponse === 'object') {
          setStats({
            totalExercises: statsResponse.totalExercises || 0,
            requiredCount: statsResponse.requiredCount || 0,
            optionalCount: statsResponse.optionalCount || 0,
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
  }, [equipmentId, currentPage, showToast]); // Include dependencies

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Only depend on the fetchData function

  const handleViewExercise = (exercise: ExerciseWithEquipmentDetails) => {
    navigate(`/exercises/${exercise.exercise?.id || exercise.id}`);
  };

  const columns: Column<ExerciseWithEquipmentDetails>[] = [
    {
      key: 'name',
      title: 'Exercise Name',
      sortable: true,
      render: (exercise) =>
        exercise.exercise?.name || exercise.name || 'Unnamed Exercise',
    },
    {
      key: 'isRequired',
      title: 'Requirement',
      render: (exercise) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            exercise.isRequired
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {exercise.isRequired ? 'Required' : 'Optional'}
        </span>
      ),
    },
    {
      key: 'setupNotes',
      title: 'Setup Notes',
      render: (exercise) => (
        <div className="max-w-md truncate">
          {exercise.setupNotes || 'No setup notes available'}
        </div>
      ),
    },
    {
      key: 'difficulty',
      title: 'Difficulty',
      render: (exercise) => {
        // Safely access the difficulty property
        const difficultyValue = (
          exercise.exercise?.difficulty ||
          exercise.difficulty ||
          'BEGINNER'
        ).toUpperCase();

        const colors = {
          BEGINNER: 'bg-green-100 text-green-800',
          INTERMEDIATE: 'bg-blue-100 text-blue-800',
          ADVANCED: 'bg-red-100 text-red-800',
        };

        const colorClass =
          colors[difficultyValue as keyof typeof colors] || colors.BEGINNER;

        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
            {difficultyValue.toLowerCase()}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (exercise) => (
        <button
          onClick={() => handleViewExercise(exercise)}
          className="text-gray-600 hover:text-gray-900"
          title="View Exercise"
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900">Total Exercises</h4>
          <p className="mt-1 text-2xl font-semibold text-blue-600">
            {stats.totalExercises}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-900">Required In</h4>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {stats.requiredCount}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900">Optional In</h4>
          <p className="mt-1 text-2xl font-semibold text-purple-600">
            {stats.optionalCount}
          </p>
        </div>
      </div>

      {/* Exercises table */}
      <DataTable
        columns={columns}
        data={exercises}
        keyExtractor={(item) =>
          item.id || `${item.exerciseId}-${item.equipmentId}`
        }
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={<Dumbbell size={36} className="text-gray-400" />}
            title="No related exercises"
            description="This equipment is not used by any exercises yet."
          />
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

export default EquipmentExercises;
