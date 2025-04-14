// src/hooks/useAdminUserForm.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './useToast';
import adminUserService from '../api/adminUserService';
import { AdminRole } from '../types/adminUserFormTypes';

export interface AdminUserFormData {
  email: string;
  password?: string;
  role: AdminRole;
}

interface UseAdminUserFormProps {
  userId?: string;
  initialData?: Partial<AdminUserFormData>;
}

export const useAdminUserForm = ({
  userId,
  initialData = {
    email: '',
    password: '',
    role: AdminRole.READONLY,
  },
}: UseAdminUserFormProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (data: AdminUserFormData) => {
    setIsSubmitting(true);
    try {
      if (userId) {
        // Update existing user - create new object without password if empty
        const updateData = {
          email: data.email,
          role: data.role as 'EDITOR' | 'READONLY',
          ...(data.password ? { password: data.password } : {}),
        };

        await adminUserService.updateAdminUser(userId, updateData);

        showToast({
          type: 'success',
          title: 'Success',
          message: 'Admin user updated successfully',
        });

        navigate(`/users/${userId}`);
      } else {
        // Create new user
        if (!data.password) {
          showToast({
            type: 'error',
            title: 'Validation Error',
            message: 'Password is required for new users',
          });
          setIsSubmitting(false);
          return;
        }

        // Ensure password is defined for new user creation
        const createData = {
          email: data.email,
          password: data.password,
          role: data.role as string,
        };

        const newUser = await adminUserService.createAdminUser(createData);

        showToast({
          type: 'success',
          title: 'Success',
          message: 'Admin user created successfully',
        });

        navigate(`/users/${newUser.id}`);
      }
    } catch (error) {
      console.error('Error submitting admin user:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: userId
          ? 'Failed to update admin user'
          : 'Failed to create admin user',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (userId) {
      navigate(`/users/${userId}`);
    } else {
      navigate('/users');
    }
  };

  return {
    isSubmitting,
    handleSubmit,
    handleCancel,
    initialData,
  };
};

export default useAdminUserForm;
