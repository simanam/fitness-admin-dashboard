// src/pages/muscles/MuscleList.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Eye, Edit, Trash2, Plus } from 'lucide-react';
import DataTable, { Column } from '../../components/common/DataTable';
import Pagination from '../../components/ui/pagination';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import EmptyState from '../../components/ui/empty-state';
import MuscleGroupFilter from '../../components/muscles/MuscleGroupFilter';
import BulkActionMenu from '../../components/muscles/BulkActionMenu';
import useMuscles from '../../hooks/useMuscles';
import { Muscle } from '../../api/muscleService';
import { Link } from 'react-router-dom';

const MuscleList = () => {
  const navigate = useNavigate();
  const {
    muscles,
    isLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    totalPages,
    totalItems,

    selectedMuscleGroupId,
    handlePageChange,

    handleMuscleGroupChange,
    deleteMuscle,

    fetchMuscles,
  } = useMuscles();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingMuscle, setDeletingMuscle] = useState<Muscle | null>(null);

  const handleViewMuscle = (muscle: Muscle) => {
    navigate(`/muscles/${muscle.id}`);
  };

  const handleEditMuscle = (muscle: Muscle, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/muscles/${muscle.id}/edit`);
  };

  const confirmDelete = (muscle: Muscle, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingMuscle(muscle);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (deletingMuscle) {
      await deleteMuscle(deletingMuscle.id);
      setShowDeleteDialog(false);
      setDeletingMuscle(null);
    }
  };

  // Define table columns
  const columns: Column<Muscle>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'commonName',
      title: 'Common Name',
      sortable: true,
      filterable: true,
      render: (muscle) => muscle.commonName || '-',
    },
    {
      key: 'muscleGroup',
      title: 'Group',
      sortable: true,
      filterable: true,
      render: (muscle) => muscle.muscleGroup?.name || '-',
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (muscle) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewMuscle(muscle);
            }}
            className="text-gray-600 hover:text-gray-900"
            title="View"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={(e) => handleEditMuscle(muscle, e)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => confirmDelete(muscle, e)}
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
        <h1 className="text-2xl font-bold">Muscles</h1>
        <div className="flex space-x-2">
          {selectedIds.length > 0 && (
            <BulkActionMenu
              selectedIds={selectedIds}
              onActionComplete={() => {
                setSelectedIds([]);
                fetchMuscles();
              }}
              disabled={isLoading}
            />
          )}
          <Link
            to="/muscles/groups"
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Layers size={16} className="mr-1" />
            Manage Groups
          </Link>
          <button
            onClick={() => navigate('/muscles/new')}
            className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus size={16} className="mr-1" />
            Add Muscle
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <MuscleGroupFilter
          selectedGroupId={selectedMuscleGroupId}
          onChange={handleMuscleGroupChange}
        />
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={muscles}
        keyExtractor={(item) => item.id}
        onRowClick={handleViewMuscle}
        isLoading={isLoading}
        isSelectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyState={
          <EmptyState
            icon={<Layers size={36} className="text-gray-400" />}
            title="No muscles found"
            description="Try adjusting your search or filters, or create a new muscle."
            action={
              <button
                onClick={() => navigate('/muscles/new')}
                className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <Plus size={16} className="mr-1" />
                Add Muscle
              </button>
            }
          />
        }
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {muscles.length} of {totalItems} muscles
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
          setDeletingMuscle(null);
        }}
        onConfirm={handleDelete}
        title="Delete Muscle"
        message={
          <p>
            Are you sure you want to delete{' '}
            <span className="font-medium">{deletingMuscle?.name}</span>? This
            action cannot be undone.
          </p>
        }
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default MuscleList;
