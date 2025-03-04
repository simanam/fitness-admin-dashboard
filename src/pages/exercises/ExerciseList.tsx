// src/pages/exercises/ExerciseList.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Plus, CheckCircle, Filter, X } from 'lucide-react';
import DataTable, { Column } from '../../components/common/DataTable';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import Pagination from '../../components/ui/pagination';
import EmptyState from '../../components/ui/empty-state';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';

// Define exercise type
interface Exercise {
  id: string;
  name: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  movement_pattern: string;
  mechanics: 'COMPOUND' | 'ISOLATION';
  force: 'PUSH' | 'PULL';
  equipment_required: boolean;
  bilateral: boolean;
  plane_of_motion: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

interface Filters {
  status?: string;
  difficulty?: string;
  mechanics?: string;
  movement_pattern?: string;
  force?: string;
}

const ExerciseList = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(
    null
  );
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // Fetch exercises on mount and when page, itemsPerPage, sortBy, sortOrder, or filters change
  useEffect(() => {
    fetchExercises();
  }, [page, itemsPerPage, sortBy, sortOrder]);

  // Apply client-side filtering when searchTerm or filters change
  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, filters]);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: itemsPerPage.toString(),
        sort: sortBy,
        order: sortOrder,
      });

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/exercises?${params.toString()}`);
      setExercises(response.data.data);
      setTotalPages(response.data.meta.totalPages);
      setTotalItems(response.data.meta.total);

      // Clear selection when data changes
      setSelectedIds([]);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch exercises. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterExercises = () => {
    let result = [...exercises];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(search) ||
          exercise.movement_pattern.toLowerCase().includes(search) ||
          exercise.mechanics.toLowerCase().includes(search)
      );
    }

    // Apply other filters
    if (filters.status) {
      result = result.filter((exercise) => exercise.status === filters.status);
    }
    if (filters.difficulty) {
      result = result.filter(
        (exercise) => exercise.difficulty === filters.difficulty
      );
    }
    if (filters.mechanics) {
      result = result.filter(
        (exercise) => exercise.mechanics === filters.mechanics
      );
    }
    if (filters.movement_pattern) {
      result = result.filter(
        (exercise) => exercise.movement_pattern === filters.movement_pattern
      );
    }
    if (filters.force) {
      result = result.filter((exercise) => exercise.force === filters.force);
    }

    setFilteredExercises(result);

    // Recalculate total pages based on filtered results
    const calculatedTotalPages = Math.ceil(result.length / itemsPerPage);
    if (calculatedTotalPages < page && calculatedTotalPages > 0) {
      setPage(1); // Reset to first page if current page exceeds new total
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top when changing page
    window.scrollTo(0, 0);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setPage(1); // Reset to first page when changing items per page
  };

  const handleSortChange = (key: string) => {
    if (sortBy === key) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default to ascending
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleViewExercise = (exercise: Exercise) => {
    navigate(`/exercises/${exercise.id}`);
  };

  const handleEditExercise = (exercise: Exercise, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/exercises/${exercise.id}/edit`);
  };

  const handleDeleteClick = (exercise: Exercise, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    setExerciseToDelete(exercise);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!exerciseToDelete) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/exercises/${exerciseToDelete.id}`);

      // Remove from state
      setExercises(exercises.filter((e) => e.id !== exerciseToDelete.id));

      showToast({
        type: 'success',
        title: 'Success',
        message: `Exercise "${exerciseToDelete.name}" deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete exercise. Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setExerciseToDelete(null);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      // Call bulk delete API
      await apiClient.post('/exercises/status/bulk', {
        ids: selectedIds,
        status: 'ARCHIVED', // Assuming we're soft-deleting by setting status to ARCHIVED
      });

      // Remove deleted exercises from state
      setExercises(
        exercises.filter((exercise) => !selectedIds.includes(exercise.id))
      );

      showToast({
        type: 'success',
        title: 'Success',
        message: `${selectedIds.length} exercises deleted successfully`,
      });

      // Clear selection
      setSelectedIds([]);
    } catch (error) {
      console.error('Error bulk deleting exercises:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete exercises. Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setBulkDeleteDialogOpen(false);
    }
  };

  const handlePublishExercise = async (
    exercise: Exercise,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent row click from triggering
    try {
      await apiClient.put(`/exercises/${exercise.id}/status`, {
        status: 'PUBLISHED',
      });

      // Update exercises in state
      setExercises(
        exercises.map((e) =>
          e.id === exercise.id ? { ...e, status: 'PUBLISHED' } : e
        )
      );

      showToast({
        type: 'success',
        title: 'Success',
        message: `Exercise "${exercise.name}" published successfully`,
      });
    } catch (error) {
      console.error('Error publishing exercise:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to publish exercise. Please try again.',
      });
    }
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilter = (key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key as keyof Filters];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
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
      render: (exercise) => (
        <span className="capitalize">{exercise.force.toLowerCase()}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (exercise) => {
        const statusColors = {
          DRAFT: 'bg-gray-100 text-gray-800',
          PUBLISHED: 'bg-green-100 text-green-800',
          ARCHIVED: 'bg-yellow-100 text-yellow-800',
        };
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${statusColors[exercise.status]}`}
          >
            {exercise.status.toLowerCase()}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (exercise) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => handleViewExercise(exercise)}
            className="text-gray-600 hover:text-gray-900"
            title="View"
          >
            <Eye size={18} />
          </button>
          {exercise.status === 'DRAFT' && (
            <button
              onClick={(e) => handlePublishExercise(exercise, e)}
              className="text-blue-600 hover:text-blue-900"
              title="Publish"
            >
              <CheckCircle size={18} />
            </button>
          )}
          <button
            onClick={(e) => handleEditExercise(exercise, e)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => handleDeleteClick(exercise, e)}
            className="text-red-600 hover:text-red-900"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Filter options
  const difficultyOptions = [
    { value: '', label: 'All Difficulties' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  const mechanicsOptions = [
    { value: '', label: 'All Mechanics' },
    { value: 'COMPOUND', label: 'Compound' },
    { value: 'ISOLATION', label: 'Isolation' },
  ];

  const forceOptions = [
    { value: '', label: 'All Forces' },
    { value: 'PUSH', label: 'Push' },
    { value: 'PULL', label: 'Pull' },
  ];

  // For pagination calculation
  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, filteredExercises.length);

  // Get exercises for current page
  const paginatedExercises = filteredExercises.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header and actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <div className="flex space-x-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDeleteClick}
              className="flex items-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
            >
              <Trash2 size={16} className="mr-1" />
              Delete Selected ({selectedIds.length})
            </button>
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

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Search input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <Filter size={16} className="mr-1" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Active filters display */}
        {Object.keys(filters).length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500">Active filters:</span>
            {Object.entries(filters).map(([key, value]) => (
              <div
                key={key}
                className="bg-gray-100 px-2 py-1 rounded-full text-xs flex items-center"
              >
                <span className="font-medium capitalize">{key}:</span>
                <span className="ml-1">{value.toLowerCase()}</span>
                <button
                  onClick={() => clearFilter(key)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filter controls */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) =>
                  handleFilterChange('difficulty', e.target.value)
                }
                className="w-full rounded-md border border-gray-300 py-2 px-3"
              >
                {difficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mechanics
              </label>
              <select
                value={filters.mechanics || ''}
                onChange={(e) =>
                  handleFilterChange('mechanics', e.target.value)
                }
                className="w-full rounded-md border border-gray-300 py-2 px-3"
              >
                {mechanicsOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Force
              </label>
              <select
                value={filters.force || ''}
                onChange={(e) => handleFilterChange('force', e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3"
              >
                {forceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Data table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">Loading exercises...</p>
          </div>
        ) : filteredExercises.length > 0 ? (
          <>
            <DataTable
              columns={columns}
              data={paginatedExercises}
              keyExtractor={(item) => item.id}
              onRowClick={handleViewExercise}
              isSelectable={true}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              className="border-none"
            />

            {/* Pagination controls */}
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startItem}</span> to{' '}
                    <span className="font-medium">{endItem}</span> of{' '}
                    <span className="font-medium">
                      {filteredExercises.length}
                    </span>{' '}
                    exercises
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="rounded-md border border-gray-300 py-1 px-2 text-sm"
                  >
                    {[5, 10, 20, 50].map((value) => (
                      <option key={value} value={value}>
                        {value} per page
                      </option>
                    ))}
                  </select>

                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(
                      filteredExercises.length / itemsPerPage
                    )}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Plus size={40} className="text-gray-400" />}
            title="No exercises found"
            description="Try changing your search or filter criteria, or add a new exercise."
            action={
              <button
                onClick={() => navigate('/exercises/new')}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Add Exercise
              </button>
            }
          />
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Exercise"
        message={
          <p>
            Are you sure you want to delete the exercise "
            <span className="font-medium">{exerciseToDelete?.name}</span>"? This
            action cannot be undone.
          </p>
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />

      {/* Bulk delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Multiple Exercises"
        message={
          <p>
            Are you sure you want to delete{' '}
            <span className="font-medium">{selectedIds.length}</span> exercises?
            This action cannot be undone.
          </p>
        }
        confirmText="Delete All"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ExerciseList;
