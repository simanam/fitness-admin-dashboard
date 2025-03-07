// src/api/muscleExerciseService.ts
import apiClient from './client';
import { Exercise } from './exerciseService';

export interface ExerciseWithMuscleDetails extends Exercise {
  role: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  activationPercentage: number;
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
  role?: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
}

export const muscleExerciseService = {
  // Get exercises that target a specific muscle
  getExercisesByMuscle: async (
    muscleId: string,
    params: FilterParams = {}
  ): Promise<PaginatedResponse<ExerciseWithMuscleDetails>> => {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await apiClient.get(
      `/muscles/${muscleId}/exercises?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get exercise statistics for a muscle
  getMuscleExerciseStats: async (muscleId: string) => {
    const response = await apiClient.get(
      `/muscles/${muscleId}/exercises/stats`
    );
    return response.data.data;
  },
};

export default muscleExerciseService;
