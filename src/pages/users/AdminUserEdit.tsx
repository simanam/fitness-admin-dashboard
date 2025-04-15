// src/pages/users/AdminUserEdit.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import AdminUserForm from '../../components/users/AdminUserForm';
import useAdminUserForm from '../../hooks/useAdminUserForm';
import adminUserService from '../../api/adminUserService';
import { AdminRole } from '../../types/adminUserFormTypes';
import type { AdminUserFormData } from '../../types/adminUserFormTypes';

const AdminUserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [initialUserData, setInitialUserData] = useState<
    Partial<AdminUserFormData>
  >({
    email: '',
    role: AdminRole.READONLY,
  });

  // Fetch user data for editing
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const user = await adminUserService.getAdminUser(id);

        setInitialUserData({
          email: user.email,
          role: user.role,
        });
      } catch (error) {
        console.error('Error fetching admin user:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load admin user details for editing.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, showToast]);

  const { isSubmitting, handleSubmit, handleCancel } = useAdminUserForm({
    userId: id,
    initialData: initialUserData,
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => navigate(`/users/${id}`)}
          className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Admin User</h1>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Edit User Information
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Update the details for this admin user.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <AdminUserForm
            initialData={initialUserData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            isEditing={true}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminUserEdit;
