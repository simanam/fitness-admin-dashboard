// src/components/users/AdminUserForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Save, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import {
  AdminUserFormData,
  FORM_VALIDATION_RULES,
} from '../../types/adminUserFormTypes';

interface AdminUserFormProps {
  initialData: Partial<AdminUserFormData>;
  onSubmit: (data: AdminUserFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

const AdminUserForm: React.FC<AdminUserFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<AdminUserFormData>({
    defaultValues: initialData,
    mode: 'onChange',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            {...register('email', FORM_VALIDATION_RULES.email)}
            className="mt-1"
            placeholder="admin@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password {!isEditing && <span className="text-red-500">*</span>}
          </label>
          <Input
            id="password"
            type="password"
            {...register(
              'password',
              isEditing
                ? { ...FORM_VALIDATION_RULES.password, required: false }
                : {
                    ...FORM_VALIDATION_RULES.password,
                    required: 'Password is required',
                  }
            )}
            className="mt-1"
            placeholder={
              isEditing
                ? 'Leave blank to keep current password'
                : 'Enter password'
            }
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
          {isEditing && (
            <p className="mt-1 text-xs text-gray-500">
              Leave blank to keep the current password
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Role <span className="text-red-500">*</span>
          </label>
          <Select
            id="role"
            {...register('role', FORM_VALIDATION_RULES.role)}
            className="mt-1"
            disabled={isSubmitting}
          >
            <option value="READONLY">Read Only</option>
            <option value="EDITOR">Editor</option>
          </Select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Editor can create and modify all resources. Read Only can only view
            resources.
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 inline mr-1" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || (!isDirty && isEditing) || !isValid}
          className="px-4 py-2 bg-black border border-transparent rounded-md text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 inline mr-1" />
          {isSubmitting
            ? 'Saving...'
            : isEditing
              ? 'Update User'
              : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default AdminUserForm;
