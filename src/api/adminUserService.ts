// src/api/adminUserService.ts
import apiClient from './client';

export interface AdminUser {
  id: string;
  email: string;
  role: 'EDITOR' | 'READONLY';
  lastLogin: string;
  createdAt: string;
}

export interface AdminUserActivity {
  id: string;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'PASSWORD_CHANGE'
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE';
  details: {
    [key: string]: any;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminUserFilterParams {
  role?: string;
  search?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const adminUserService = {
  // Get all admin users with pagination and filters
  getAdminUsers: async (
    params: AdminUserFilterParams = {}
  ): Promise<PaginatedResponse<AdminUser>> => {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/users?${queryParams.toString()}`);
    return response.data;
  },

  // Get a single admin user by ID
  getAdminUser: async (id: string): Promise<AdminUser> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  },

  // Create a new admin user
  createAdminUser: async (user: {
    email: string;
    password: string;
    role: string;
  }): Promise<AdminUser> => {
    const response = await apiClient.post('/users', user);
    return response.data.data;
  },

  // Update an admin user
  updateAdminUser: async (
    id: string,
    user: Partial<Omit<AdminUser, 'id' | 'lastLogin' | 'createdAt'>>
  ): Promise<AdminUser> => {
    const response = await apiClient.put(`/users/${id}`, user);
    return response.data.data;
  },

  // Delete an admin user
  deleteAdminUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Get admin user activity
  getAdminUserActivity: async (
    id: string,
    limit: number = 5
  ): Promise<AdminUserActivity[]> => {
    const response = await apiClient.get(
      `/users/${id}/activity?limit=${limit}`
    );
    return response.data.data;
  },
};

export default adminUserService;
