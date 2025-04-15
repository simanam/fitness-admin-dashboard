// src/pages/exercises/ExerciseList.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Plus, Dumbbell, Search, X } from 'lucide-react';
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

  const { isUpdating: isStatusUpdating } = useExerciseStatus({
    onSuccess: fetchExercises,
  });

  const { deleteExercise, isDeleting } = useExerciseDeletion({
    onSuccess: () => {
      // If we deleted the last item on a page, go to previous page
      if (exercises.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1);
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

  const confirmDelete = (exercise: Exercise, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
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

  // Format values to proper display format
  const formatCamelCase = (str: string) => {
    return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
          beginner: 'bg-green-100 text-green-800',
          intermediate: 'bg-blue-100 text-blue-800',
          advanced: 'bg-red-100 text-red-800',
        };
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${colors[exercise.difficulty as keyof typeof colors]}`}
          >
            {formatCamelCase(exercise.difficulty)}
          </span>
        );
      },
    },
    {
      key: 'movement_pattern',
      title: 'Pattern',
      sortable: true,
      filterable: true,
      render: (exercise) => formatCamelCase(exercise.movement_pattern),
    },
    {
      key: 'mechanics',
      title: 'Mechanics',
      sortable: true,
      filterable: true,
      render: (exercise) => formatCamelCase(exercise.mechanics),
    },
    {
      key: 'force',
      title: 'Force',
      sortable: true,
      filterable: true,
      render: (exercise) => formatCamelCase(exercise.force),
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
      key: '_actions',
      title: 'Actions',
      render: (exercise) => (
        <div className="flex space-x-2">
          <button
            type="button"
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
            type="button"
            onClick={(e) => handleEditExercise(exercise, e)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => confirmDelete(exercise, e)}
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
            type="button"
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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => handleSearchChange('')}
              >
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter dropdowns could be added here */}
          <div className="flex items-center space-x-2">
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={filters.difficulty || ''}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Clear filters button */}
          {(Object.keys(filters).length > 0 || searchQuery) && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <X size={16} className="mr-1" />
              Clear Filters
            </button>
          )}
        </div>
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
                type="button"
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
