// src/pages/users/AdminUserCreate.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminUserForm from '../../components/users/AdminUserForm';
import useAdminUserForm from '../../hooks/useAdminUserForm';
import { defaultAdminUserFormData } from '../../types/adminUserFormTypes';
import { AdminRole } from '../../types/adminUserFormTypes';

const AdminUserCreate = () => {
  const navigate = useNavigate();
  const { isSubmitting, handleSubmit, handleCancel } = useAdminUserForm({
    initialData: defaultAdminUserFormData,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add Admin User</h1>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            User Information
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter the details for the new admin user.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <AdminUserForm
            initialData={{ email: '', password: '', role: AdminRole.READONLY }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            isEditing={false}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminUserCreate;
