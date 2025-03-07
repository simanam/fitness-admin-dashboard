// src/pages/muscles/tabs/MuscleExercises.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Dumbbell } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import DataTable, { Column } from '../../../components/common/DataTable';
import EmptyState from '../../../components/ui/empty-state';
import Pagination from '../../../components/ui/pagination';
import muscleExerciseService, {
  ExerciseWithMuscleDetails,
} from '../../../api/muscleExerciseService';
import { Exercise } from '../../../api/exerciseService';

interface MuscleExercisesProps {
  muscleId: string;
}

interface MuscleExerciseStats {
  total: number;
  byRole: {
    PRIMARY: number;
    SECONDARY: number;
    TERTIARY: number;
  };
}

const MuscleExercises: React.FC<MuscleExercisesProps> = ({ muscleId }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [exercises, setExercises] = useState<ExerciseWithMuscleDetails[]>([]);
  const [stats, setStats] = useState<MuscleExerciseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [exercisesResponse, statsResponse] = await Promise.all([
          muscleExerciseService.getExercisesByMuscle(muscleId, {
            page: currentPage,
            per_page: 10,
          }),
          muscleExerciseService.getMuscleExerciseStats(muscleId),
        ]);

        setExercises(exercisesResponse.data);
        setTotalPages(exercisesResponse.meta.totalPages);
        setTotalItems(exercisesResponse.meta.total);
        setStats(statsResponse);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load related exercises',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [muscleId, currentPage]);

  const handleViewExercise = (exercise: ExerciseWithTarget) => {
    navigate(`/exercises/${exercise.id}`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PRIMARY':
        return 'bg-blue-100 text-blue-800';
      case 'SECONDARY':
        return 'bg-purple-100 text-purple-800';
      case 'TERTIARY':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<ExerciseWithTarget>[] = [
    {
      key: 'name',
      title: 'Exercise Name',
      sortable: true,
    },
    {
      key: 'role',
      title: 'Role',
      render: (exercise) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${getRoleColor(exercise.role)}`}
        >
          {exercise.role.toLowerCase()}
        </span>
      ),
    },
    {
      key: 'activationPercentage',
      title: 'Activation',
      render: (exercise) => (
        <div className="flex items-center">
          <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[100px] mr-2">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${exercise.activationPercentage}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {exercise.activationPercentage}%
          </span>
        </div>
      ),
    },
    {
      key: 'difficulty',
      title: 'Difficulty',
      render: (exercise) => {
        const colors = {
          BEGINNER: 'bg-green-100 text-green-800',
          INTERMEDIATE: 'bg-blue-100 text-blue-800',
          ADVANCED: 'bg-red-100 text-red-800',
        };
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${colors[exercise.difficulty]}`}
          >
            {exercise.difficulty.toLowerCase()}
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
          <h4 className="text-sm font-medium text-blue-900">Primary Target</h4>
          <p className="mt-1 text-2xl font-semibold text-blue-600">
            {stats?.byRole.PRIMARY || 0}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900">
            Secondary Target
          </h4>
          <p className="mt-1 text-2xl font-semibold text-purple-600">
            {stats?.byRole.SECONDARY || 0}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900">Tertiary Target</h4>
          <p className="mt-1 text-2xl font-semibold text-gray-600">
            {stats?.byRole.TERTIARY || 0}
          </p>
        </div>
      </div>

      {/* Exercises table */}
      <DataTable
        columns={columns}
        data={exercises}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={<Dumbbell size={36} className="text-gray-400" />}
            title="No related exercises"
            description="This muscle is not targeted by any exercises yet."
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

export default MuscleExercises;
