// src/pages/joints/JointList.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Plus, Search, X, Filter } from 'lucide-react';
import DataTable, { Column } from '../../components/common/DataTable';
import Pagination from '../../components/ui/pagination';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import EmptyState from '../../components/ui/empty-state';
import TypeFilter from '../../components/joints/TypeFilter';
import TypeBadge from '../../components/joints/TypeBadge';
import useJoints from '../../hooks/useJoints';
import { Joint } from '../../api/jointService';

const JointList = () => {
  const navigate = useNavigate();
  const {
    joints,
    isLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    typeFilter,
    handlePageChange,
    handleSearchChange,
    handleTypeFilterChange,
    clearFilters,
    deleteJoint,
    getAvailableTypes,
  } = useJoints();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingJoint, setDeletingJoint] = useState<Joint | null>(null);

  const handleViewJoint = (joint: Joint) => {
    navigate(`/joints/${joint.id}`);
  };

  const handleEditJoint = (joint: Joint, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/joints/${joint.id}/edit`);
  };

  const confirmDelete = (joint: Joint, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    setDeletingJoint(joint);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (deletingJoint) {
      await deleteJoint(deletingJoint.id);
      setShowDeleteDialog(false);
      setDeletingJoint(null);
    }
  };

  // Define table columns
  const columns: Column<Joint>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      filterable: true,
      render: (joint) => <TypeBadge type={joint.type} />,
    },
    {
      key: 'description',
      title: 'Description',
      render: (joint) => (
        <div className="max-w-md truncate">
          {joint.description || 'No description available'}
        </div>
      ),
    },
    {
      key: 'movements',
      title: 'Primary Movements',
      render: (joint) => (
        <div>
          {joint.movements.primary && joint.movements.primary.length > 0 ? (
            <div className="space-x-1">
              {joint.movements.primary.slice(0, 2).map((movement, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                >
                  {movement.name}
                </span>
              ))}
              {joint.movements.primary.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{joint.movements.primary.length - 2} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">No movements defined</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (joint) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewJoint(joint);
            }}
            className="text-gray-600 hover:text-gray-900"
            title="View"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={(e) => handleEditJoint(joint, e)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => confirmDelete(joint, e)}
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
        <h1 className="text-2xl font-bold">Joints</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/joints/new')}
            className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus size={16} className="mr-1" />
            Add Joint
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
              placeholder="Search joints..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => handleSearchChange('')}
              >
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Clear filters button */}
          {(typeFilter || searchQuery) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <Filter size={16} className="mr-1" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Type filter */}
        <TypeFilter
          selectedType={typeFilter}
          onChange={handleTypeFilterChange}
          types={getAvailableTypes()}
        />
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={joints}
        keyExtractor={(item) => item.id}
        onRowClick={handleViewJoint}
        isLoading={isLoading}
        isSelectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyState={
          <EmptyState
            icon={<div className="text-4xl">🦴</div>}
            title="No joints found"
            description="Try adjusting your search or filters, or create a new joint."
            action={
              <button
                onClick={() => navigate('/joints/new')}
                className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <Plus size={16} className="mr-1" />
                Add Joint
              </button>
            }
          />
        }
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {joints.length} of {totalItems} joints
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
          setDeletingJoint(null);
        }}
        onConfirm={handleDelete}
        title="Delete Joint"
        message={
          <p>
            Are you sure you want to delete{' '}
            <span className="font-medium">{deletingJoint?.name}</span>? This
            action cannot be undone.
          </p>
        }
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default JointList;
