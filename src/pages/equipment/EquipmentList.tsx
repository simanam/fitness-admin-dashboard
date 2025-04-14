// src/pages/equipment/EquipmentList.tsx
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Plus, Box, Search, X, Filter, Trash2 } from 'lucide-react';
import DataTable, { Column } from '../../components/common/DataTable';
import Pagination from '../../components/ui/pagination';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import EmptyState from '../../components/ui/empty-state';
import CategoryFilter from '../../components/equipment/CategoryFilter';
import CommonBadge from '../../components/equipment/CommonBadge';
import useEquipment from '../../hooks/useEquipment';
import useEquipmentDeletion from '../../hooks/useEquipmentDeletion';
import { Equipment } from '../../api/equipmentService';
import { Checkbox } from '../../components/ui/checkbox';

const EquipmentList = () => {
  const navigate = useNavigate();
  const {
    equipment,
    isLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    categoryFilter,
    isCommonFilter,
    handlePageChange,
    handleSearchChange,
    handleCategoryFilterChange,
    handleIsCommonFilterChange,
    clearFilters,
    fetchEquipment,
    getAvailableCategories,
  } = useEquipment();

  const {
    isDeleting,
    showDeleteDialog,
    equipmentToDelete,
    confirmDelete,
    cancelDelete,
    deleteEquipment,
  } = useEquipmentDeletion({
    onSuccess: fetchEquipment,
    redirectTo: undefined, // Don't redirect since we're staying on this page
  });

  const handleViewEquipment = (item: Equipment) => {
    navigate(`/equipment/${item.id}`);
  };

  const handleEditEquipment = (item: Equipment, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/equipment/${item.id}/edit`);
  };

  const handleDeleteClick = (item: Equipment, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    confirmDelete(item.id, item.name);
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Define table columns
  const columns: Column<Equipment>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      filterable: true,
      render: (item) => formatCategoryName(item.category),
    },
    {
      key: 'isCommon',
      title: 'Type',
      sortable: true,
      filterable: true,
      render: (item) => <CommonBadge isCommon={item.isCommon} />,
    },
    {
      key: 'description',
      title: 'Description',
      render: (item) => (
        <div className="max-w-md truncate">
          {item.description || 'No description available'}
        </div>
      ),
    },
    {
      key: '_actions',
      title: 'Actions',
      render: (item) => (
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleViewEquipment(item);
            }}
            className="text-gray-600 hover:text-gray-900"
            title="View"
          >
            <Eye size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => handleEditEquipment(item, e)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => handleDeleteClick(item, e)}
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
        <h1 className="text-2xl font-bold">Equipment</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => navigate('/equipment/new')}
            className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus size={16} className="mr-1" />
            Add Equipment
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
              placeholder="Search equipment..."
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

          {/* Common equipment filter toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCommon"
              checked={isCommonFilter === true}
              onChange={(e) => handleIsCommonFilterChange(e.target.checked)}
              label="Common Equipment Only"
            />
          </div>

          {/* Clear filters button */}
          {(categoryFilter || searchQuery || isCommonFilter !== undefined) && (
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

        {/* Category filter */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Filter by Category
          </h3>
          <CategoryFilter
            selectedCategory={categoryFilter}
            onChange={handleCategoryFilterChange}
            categories={getAvailableCategories()}
          />
        </div>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={equipment}
        keyExtractor={(item) => item.id}
        onRowClick={handleViewEquipment}
        isLoading={isLoading}
        isSelectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyState={
          <EmptyState
            icon={<Box size={36} className="text-gray-400" />}
            title="No equipment found"
            description="Try adjusting your search or filters, or create new equipment."
            action={
              <button
                type="button"
                onClick={() => navigate('/equipment/new')}
                className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <Plus size={16} className="mr-1" />
                Add Equipment
              </button>
            }
          />
        }
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {equipment.length} of {totalItems} equipment items
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete confirmation dialog - now using the one from the hook */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={deleteEquipment}
        title="Delete Equipment"
        message={
          <p>
            Are you sure you want to delete{' '}
            <span className="font-medium">{equipmentToDelete?.name}</span>? This
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

export default EquipmentList;
