// src/pages/exercises/ExerciseList.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Plus, Dumbbell } from 'lucide-react';
import DataTable, { Column } from '../../components/common/DataTable';
import Pagination from '../../components/ui/pagination';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import EmptyState from '../../components/ui/empty-state';
import { useExerciseStatus } from '../../hooks/useExerciseStatus';
import { useExerciseDeletion } from '../../hooks/useExerciseDeletion';
import StatusDropdown from '../../components/exercises/StatusDropdown';
import BulkActionMenu from '../../components/exercises/BulkActionMenu';
import useExercises from '../../hooks/useExercises';
import { Exercise } from '../../api/exerciseService';

const ExerciseList = () => {
  const navigate = useNavigate();
  const {
    exercises,
    isLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    filters,
    handlePageChange,
    handleSearchChange,
    handleFilterChange,
    clearFilters,
    fetchExercises,
  } = useExercises();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(
    null
  );

  const { updateStatus, isUpdating: isStatusUpdating } = useExerciseStatus({
    onSuccess: fetchExercises,
  });

  const { deleteExercise, isDeleting } = useExerciseDeletion({
    onSuccess: () => {
      // If we deleted the last item on a page, go to previous page
      if (exercises.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchExercises();
      }
    },
  });

  const handleViewExercise = (exercise: Exercise) => {
    navigate(`/exercises/${exercise.id}`);
  };

  const handleEditExercise = (exercise: Exercise, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/exercises/${exercise.id}/edit`);
  };

  const confirmDelete = (exercise: Exercise) => {
    setDeletingExercise(exercise);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (deletingExercise) {
      await deleteExercise(deletingExercise.id);
      setShowDeleteDialog(false);
      setDeletingExercise(null);
    }
  };

  // Define table columns
  const columns: Column<Exercise>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'difficulty',
      title: 'Difficulty',
      sortable: true,
      filterable: true,
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
      key: 'movement_pattern',
      title: 'Pattern',
      sortable: true,
      filterable: true,
    },
    {
      key: 'mechanics',
      title: 'Mechanics',
      sortable: true,
      filterable: true,
    },
    {
      key: 'force',
      title: 'Force',
      sortable: true,
      filterable: true,
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (exercise) => (
        <StatusDropdown
          exerciseId={exercise.id}
          currentStatus={exercise.status}
          onStatusChange={fetchExercises}
          disabled={isLoading || isStatusUpdating}
        />
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (exercise) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewExercise(exercise);
            }}
            className="text-gray-600 hover:text-gray-900"
            title="View"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={(e) => handleEditExercise(exercise, e)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(exercise);
            }}
            className="text-red-600 hover:text-red-900"
            title="Delete"
            disabled={isDeleting}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <div className="flex space-x-2">
          {selectedIds.length > 0 && (
            <BulkActionMenu
              selectedIds={selectedIds}
              onActionComplete={() => {
                setSelectedIds([]);
                fetchExercises();
              }}
              disabled={isLoading}
            />
          )}
          <button
            onClick={() => navigate('/exercises/new')}
            className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus size={16} className="mr-1" />
            Add Exercise
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        {/* ... Rest of your search and filters code ... */}
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={exercises}
        keyExtractor={(item) => item.id}
        onRowClick={handleViewExercise}
        isLoading={isLoading}
        isSelectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyState={
          <EmptyState
            icon={<Dumbbell size={36} className="text-gray-400" />}
            title="No exercises found"
            description="Try adjusting your search or filters, or create a new exercise."
            action={
              <button
                onClick={() => navigate('/exercises/new')}
                className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <Plus size={16} className="mr-1" />
                Add Exercise
              </button>
            }
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
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingExercise(null);
        }}
        onConfirm={handleDelete}
        title="Delete Exercise"
        message={
          <p>
            Are you sure you want to delete{' '}
            <span className="font-medium">{deletingExercise?.name}</span>? This
            action cannot be undone.
          </p>
        }
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ExerciseList;
