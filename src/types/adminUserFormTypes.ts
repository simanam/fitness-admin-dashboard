// src/types/adminUserFormTypes.ts

export enum AdminRole {
  EDITOR = 'editor',
  READONLY = 'readonly',
}

export interface AdminUserFormData {
  email: string;
  password?: string;
  role: AdminRole;
}

export const defaultAdminUserFormData: AdminUserFormData = {
  email: '',
  password: '',
  role: AdminRole.READONLY,
};

export const FORM_VALIDATION_RULES = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address',
    },
  },
  password: {
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters',
    },
  },
  role: {
    required: 'Role is required',
  },
};

export const FORM_SECTIONS = {
  userInfo: {
    title: 'User Information',
    description: 'Enter the admin user details.',
  },
};
