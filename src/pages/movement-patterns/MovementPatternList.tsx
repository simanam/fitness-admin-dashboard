// src/pages/movement-patterns/MovementPatternList.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  FileText,
  Search,
  X,
  Filter,
} from 'lucide-react';
import type { Column } from '../../components/common/DataTable';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/ui/pagination';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import EmptyState from '../../components/ui/empty-state';
import CategoryFilter from '../../components/movement-patterns/CategoryFilter';
import TypeFilter from '../../components/movement-patterns/TypeFilter';
import CategoryBadge from '../../components/movement-patterns/CategoryBadge';
import TypeBadge from '../../components/movement-patterns/TypeBadge';
import useMovementPatterns from '../../hooks/useMovementPatterns';
import type { MovementPattern } from '../../api/movementPatternService';

const MovementPatternList = () => {
  const navigate = useNavigate();
  const {
    patterns,
    isLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    categoryFilter,
    typeFilter,
    handlePageChange,
    handleSearchChange,
    handleCategoryFilterChange,
    handleTypeFilterChange,
    clearFilters,
    deleteMovementPattern,
    getAvailableCategories,
    getAvailableTypes,
  } = useMovementPatterns();

  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [types, setTypes] = useState<{ value: string; label: string }[]>([]);

  // Fetch filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch both in parallel
        const [fetchedCategories, fetchedTypes] = await Promise.all([
          getAvailableCategories(),
          getAvailableTypes(),
        ]);

        setCategories(fetchedCategories);
        setTypes(fetchedTypes);
      } catch (error) {
        console.error('Error fetching filters:', error);
        // Provide fallbacks if necessary
        setCategories([
          { value: 'lower_body', label: 'Lower Body' },
          { value: 'upper_body', label: 'Upper Body' },
          { value: 'core', label: 'Core' },
          { value: 'full_body', label: 'Full Body' },
        ]);
        setTypes([
          { value: 'push', label: 'Push' },
          { value: 'pull', label: 'Pull' },
          { value: 'squat', label: 'Squat' },
          { value: 'hinge', label: 'Hinge' },
          { value: 'lunge', label: 'Lunge' },
        ]);
      }
    };

    void fetchFilters();
  }, [getAvailableCategories, getAvailableTypes]);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPattern, setDeletingPattern] =
    useState<MovementPattern | null>(null);

  const handleViewPattern = (pattern: MovementPattern) => {
    navigate(`/movement-patterns/${pattern.id}`);
  };

  const handleEditPattern = (pattern: MovementPattern, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/movement-patterns/${pattern.id}/edit`);
  };

  const confirmDelete = (pattern: MovementPattern, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    setDeletingPattern(pattern);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (deletingPattern) {
      await deleteMovementPattern(deletingPattern.id);
      setShowDeleteDialog(false);
      setDeletingPattern(null);
    }
  };

  // Define table columns
  const columns: Column<MovementPattern>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'patternType',
      title: 'Type',
      sortable: true,
      filterable: true,
      render: (pattern) => <TypeBadge type={pattern.patternType} />,
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      filterable: true,
      render: (pattern) => <CategoryBadge category={pattern.category} />,
    },
    {
      key: 'description',
      title: 'Description',
      render: (pattern) => (
        <div className="max-w-md truncate">
          {pattern.description || 'No description available'}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (pattern) => (
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleViewPattern(pattern);
            }}
            className="text-gray-600 hover:text-gray-900"
            title="View"
          >
            <Eye size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => handleEditPattern(pattern, e)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => confirmDelete(pattern, e)}
            className="text-red-600 hover:text-red-900"
            title="Delete"
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
        <h1 className="text-2xl font-bold">Movement Patterns</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => navigate('/movement-patterns/new')}
            className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus size={16} className="mr-1" />
            Add Pattern
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        {/* Search bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search movement patterns..."
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

          {/* Clear filters button */}
          {(categoryFilter || typeFilter || searchQuery) && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <Filter size={16} className="mr-1" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Category and Type filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoryFilter
            selectedCategory={categoryFilter}
            onChange={handleCategoryFilterChange}
            categories={categories}
          />
          <TypeFilter
            selectedType={typeFilter}
            onChange={handleTypeFilterChange}
            types={types}
          />
        </div>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={patterns}
        keyExtractor={(item) => item.id}
        onRowClick={handleViewPattern}
        isLoading={isLoading}
        isSelectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyState={
          <EmptyState
            icon={<FileText size={36} className="text-gray-400" />}
            title="No movement patterns found"
            description="Try adjusting your search or filters, or create a new movement pattern."
            action={
              <button
                type="button"
                onClick={() => navigate('/movement-patterns/new')}
                className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <Plus size={16} className="mr-1" />
                Add Pattern
              </button>
            }
          />
        }
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {patterns.length} of {totalItems} movement patterns
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
          setDeletingPattern(null);
        }}
        onConfirm={handleDelete}
        title="Delete Movement Pattern"
        message={
          <p>
            Are you sure you want to delete{' '}
            <span className="font-medium">{deletingPattern?.name}</span>? This
            action cannot be undone.
          </p>
        }
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default MovementPatternList;
