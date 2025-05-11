// src/api/equipmentService.ts
import apiClient from './client';

export interface Equipment {
  id: string;
  name: string;
  category:
    | 'free_weights'
    | 'machines'
    | 'cables'
    | 'bodyweight'
    | 'cardio'
    | 'accessories'
    | 'benches'
    | 'racks';
  description: string | null;
  isCommon: boolean;
  alternatives?: {
    equipment_options: EquipmentAlternative[];
  };
}

export interface EquipmentAlternative {
  name: string;
  modification_needed: string;
  difficulty_change: number;
  limitation_notes?: string;
}

export interface EquipmentFilterParams {
  category?: string;
  isCommon?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
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

export const equipmentService = {
  // Get all equipment with pagination and filters
  getAllEquipment: async (
    params: EquipmentFilterParams = {}
  ): Promise<Equipment[]> => {
    // For simplicity, fetch all equipment without pagination for dropdown selections
    const response = await apiClient.get('/equipment', {
      params: {
        per_page: 100,
        ...params,
      },
    });

    return response.data.data || [];
  },

  // Get equipment with pagination
  // Get equipment with pagination and filters
  getEquipment: async (
    params: EquipmentFilterParams = {}
  ): Promise<PaginatedResponse<Equipment>> => {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await apiClient.get(
      `/equipment?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get a single equipment by ID
  getEquipmentById: async (id: string): Promise<Equipment> => {
    const response = await apiClient.get(`/equipment/${id}`);
    return response.data.data;
  },

  // Create new equipment
  createEquipment: async (
    equipment: Partial<Equipment>
  ): Promise<Equipment> => {
    const response = await apiClient.post('/equipment', equipment);
    return response.data.data;
  },

  // Update equipment
  updateEquipment: async (
    id: string,
    equipment: Partial<Equipment>
  ): Promise<Equipment> => {
    const response = await apiClient.put(`/equipment/${id}`, equipment);
    return response.data.data;
  },

  // Delete equipment
  deleteEquipment: async (id: string): Promise<void> => {
    await apiClient.delete(`/equipment/${id}`);
  },

  // Add alternative equipment
  addAlternative: async (
    id: string,
    alternative: EquipmentAlternative
  ): Promise<Equipment> => {
    const response = await apiClient.post(
      `/equipment/${id}/alternatives`,
      alternative
    );
    return response.data.data;
  },

  // Remove alternative equipment
  removeAlternative: async (
    id: string,
    alternativeName: string
  ): Promise<Equipment> => {
    const response = await apiClient.delete(
      `/equipment/${id}/alternatives/${alternativeName}`
    );
    return response.data.data;
  },
};

export default equipmentService;
