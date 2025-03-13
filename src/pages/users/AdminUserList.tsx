// src/pages/users/AdminUserList.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
  Search,
  X,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import DataTable, { Column } from '../../components/common/DataTable';
import Pagination from '../../components/ui/pagination';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import EmptyState from '../../components/ui/empty-state';
import RoleFilter from '../../components/users/RoleFilter';
import RoleBadge from '../../components/users/RoleBadge';
import useAdminUsers from '../../hooks/useAdminUsers';
import { AdminUser } from '../../api/adminUserService';

const AdminUserList = () => {
  const navigate = useNavigate();
  const {
    users,
    isLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    roleFilter,
    handlePageChange,
    handleSearchChange,
    handleRoleFilterChange,
    clearFilters,
    deleteUser,
    fetchUsers,
  } = useAdminUsers();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  const handleViewUser = (user: AdminUser) => {
    navigate(`/users/${user.id}`);
  };

  const handleEditUser = (user: AdminUser, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/users/${user.id}/edit`);
  };

  const confirmDelete = (user: AdminUser, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    setDeletingUser(user);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (deletingUser) {
      await deleteUser(deletingUser.id);
      setShowDeleteDialog(false);
      setDeletingUser(null);
    }
  };

  // Format timestamp for display
  const formatDate = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Define table columns
  const columns: Column<AdminUser>[] = [
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      filterable: true,
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      filterable: true,
      render: (user) => <RoleBadge role={user.role} />,
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      sortable: true,
      render: (user) => (user.lastLogin ? formatDate(user.lastLogin) : 'Never'),
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (user) => formatDate(user.createdAt),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (user) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewUser(user);
            }}
            className="text-gray-600 hover:text-gray-900"
            title="View"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={(e) => handleEditUser(user, e)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => confirmDelete(user, e)}
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
        <h1 className="text-2xl font-bold">Admin Users</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/users/new')}
            className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus size={16} className="mr-1" />
            Add User
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
              placeholder="Search by email..."
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
          {(roleFilter || searchQuery) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <Filter size={16} className="mr-1" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Role filter */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Filter by Role
          </h3>
          <RoleFilter
            selectedRole={roleFilter}
            onChange={handleRoleFilterChange}
          />
        </div>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(item) => item.id}
        onRowClick={handleViewUser}
        isLoading={isLoading}
        isSelectable={false}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyState={
          <EmptyState
            icon={<Users size={36} className="text-gray-400" />}
            title="No admin users found"
            description="Try adjusting your search or filters, or create a new admin user."
            action={
              <button
                onClick={() => navigate('/users/new')}
                className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <Plus size={16} className="mr-1" />
                Add User
              </button>
            }
          />
        }
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {users.length} of {totalItems} admin users
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
          setDeletingUser(null);
        }}
        onConfirm={handleDelete}
        title="Delete Admin User"
        message={
          <p>
            Are you sure you want to delete the admin user{' '}
            <span className="font-medium">{deletingUser?.email}</span>? This
            action cannot be undone.
          </p>
        }
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default AdminUserList;
