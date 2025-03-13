// src/api/equipmentExerciseService.ts
import apiClient from './client';
import { Exercise } from './exerciseService';

export interface ExerciseWithEquipmentDetails extends Exercise {
  isRequired: boolean;
  setupNotes?: string;
  order: number;
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

export interface FilterParams {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  isRequired?: boolean;
}

export interface ExerciseStats {
  total: number;
  byRequired: {
    required: number;
    optional: number;
  };
}

export const equipmentExerciseService = {
  // Get exercises that use a specific equipment
  getExercisesByEquipment: async (
    equipmentId: string,
    params: FilterParams = {}
  ): Promise<PaginatedResponse<ExerciseWithEquipmentDetails>> => {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await apiClient.get(
      `/equipment/${equipmentId}/exercises?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get exercise statistics for equipment
  getEquipmentExerciseStats: async (equipmentId: string) => {
    const response = await apiClient.get(
      `/equipment/${equipmentId}/exercises/stats`
    );
    return response.data.data;
  },
};

export default equipmentExerciseService;
