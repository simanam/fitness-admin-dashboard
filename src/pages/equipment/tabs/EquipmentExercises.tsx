// src/pages/equipment/tabs/EquipmentExercises.tsx
import { useState, useEffect } from 'react';
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

interface EquipmentExerciseStats {
  total: number;
  byRequired: {
    required: number;
    optional: number;
  };
}

const EquipmentExercises: React.FC<EquipmentExercisesProps> = ({
  equipmentId,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [exercises, setExercises] = useState<ExerciseWithEquipmentDetails[]>(
    []
  );
  const [stats, setStats] = useState<EquipmentExerciseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [exercisesResponse, statsResponse] = await Promise.all([
          equipmentExerciseService.getExercisesByEquipment(equipmentId, {
            page: currentPage,
            per_page: 10,
          }),
          equipmentExerciseService.getEquipmentExerciseStats(equipmentId),
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
  }, [equipmentId, currentPage, showToast]);

  const handleViewExercise = (exercise: ExerciseWithEquipmentDetails) => {
    navigate(`/exercises/${exercise.id}`);
  };

  const columns: Column<ExerciseWithEquipmentDetails>[] = [
    {
      key: 'name',
      title: 'Exercise Name',
      sortable: true,
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
        const colors = {
          BEGINNER: 'bg-green-100 text-green-800',
          INTERMEDIATE: 'bg-blue-100 text-blue-800',
          ADVANCED: 'bg-red-100 text-red-800',
        };
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${colors[exercise.difficulty as keyof typeof colors]}`}
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
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900">
              Total Exercises
            </h4>
            <p className="mt-1 text-2xl font-semibold text-blue-600">
              {stats.total || 0}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-900">Required In</h4>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {stats.byRequired.required || 0}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-900">Optional In</h4>
            <p className="mt-1 text-2xl font-semibold text-purple-600">
              {stats.byRequired.optional || 0}
            </p>
          </div>
        </div>
      )}

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
