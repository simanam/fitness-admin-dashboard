// src/pages/users/AdminUserDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle,
  Mail,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '../../hooks/useToast';
import ConfirmationDialog from '../../components/ui/confirmation-dialog';
import ActivityList from '../../components/users/ActivityList';
import RoleBadge from '../../components/users/RoleBadge';
import adminUserService, { AdminUser } from '../../api/adminUserService';
import useAdminUserActivity from '../../hooks/useAdminUserActivity';

const AdminUserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get user activity data
  const {
    activities,
    isLoading: isActivitiesLoading,
    refetch: refetchActivities,
  } = useAdminUserActivity(id || '');

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await adminUserService.getAdminUser(id);
        setUser(data);
      } catch (error) {
        console.error('Error fetching admin user:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load admin user details.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, showToast]);

  // Handle user deletion
  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      await adminUserService.deleteAdminUser(user.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Admin user deleted successfully',
      });
      navigate('/users');
    } catch (error) {
      console.error('Error deleting admin user:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete admin user',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error state if user not found
  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          Admin user not found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          The admin user you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/users')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button, actions and title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/users')}
            className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.email}</h1>
            <div className="flex items-center mt-1 space-x-2">
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/users/${id}/edit`)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit size={16} className="mr-1" />
            Edit
          </button>

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            <Trash2 size={16} className="mr-1" />
            Delete
          </button>
        </div>
      </div>

      {/* User details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Basic info */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                User Information
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail size={16} className="mr-1" />
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <span className="mr-1">🔑</span>
                    Role
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <RoleBadge role={user.role} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar size={16} className="mr-1" />
                    Last Login
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.lastLogin
                      ? formatDate(user.lastLogin)
                      : 'Never logged in'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar size={16} className="mr-1" />
                    Created On
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(user.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Right column - Activity */}
        <div className="md:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Activity History
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <ActivityList
                activities={activities}
                isLoading={isActivitiesLoading}
                onRefresh={refetchActivities}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Admin User"
        message={
          <p>
            Are you sure you want to delete the admin user{' '}
            <span className="font-medium">{user.email}</span>? This action
            cannot be undone.
          </p>
        }
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminUserDetail;
