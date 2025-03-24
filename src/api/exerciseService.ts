// src/api/exerciseService.ts
import apiClient from './client';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  movement_pattern: string;
  mechanics: 'COMPOUND' | 'ISOLATION';
  force: 'PUSH' | 'PULL';
  equipment_required: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  bilateral: boolean;
  plane_of_motion: string;
  created_at: string;
  updated_at: string;
  instructions?: string; // Add this field if it's missing
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

export interface ExerciseFilterParams {
  status?: string;
  difficulty?: string;
  mechanics?: string;
  force?: string;
  movement_pattern?: string;
  equipment_required?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'ASC' | 'DESC'; // Changed from lowercase to uppercase
}

export const exerciseService = {
  // Get exercises with pagination and filters
  getExercises: async (
    params: ExerciseFilterParams = {}
  ): Promise<PaginatedResponse<Exercise>> => {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        // Convert order parameter to uppercase if it exists
        if (key === 'order' && typeof value === 'string') {
          queryParams.append(key, value.toUpperCase());
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const response = await apiClient.get(
      `/exercises?${queryParams.toString()}`
    );

    console.log(response, 'execros');

    return response.data;
  },

  // Get a single exercise by ID
  getExercise: async (id: string): Promise<Exercise> => {
    const response = await apiClient.get(`/exercises/${id}`);
    return response.data.data;
  },

  // Create a new exercise
  createExercise: async (exercise: Partial<Exercise>): Promise<Exercise> => {
    const response = await apiClient.post('/exercises', exercise);
    return response.data.data;
  },

  // Update an existing exercise
  updateExercise: async (
    id: string,
    exercise: Partial<Exercise>
  ): Promise<Exercise> => {
    const response = await apiClient.put(`/exercises/${id}`, exercise);
    return response.data.data;
  },

  // Delete an exercise
  deleteExercise: async (id: string): Promise<void> => {
    await apiClient.delete(`/exercises/${id}`);
  },

  // Update exercise status
  updateExerciseStatus: async (
    id: string,
    status: string
  ): Promise<Exercise> => {
    const response = await apiClient.put(`/exercises/${id}/status`, { status });
    return response.data.data;
  },

  // Bulk update exercise status
  bulkUpdateStatus: async (
    ids: string[],
    status: string
  ): Promise<{ updatedCount: number }> => {
    const response = await apiClient.post('/exercises/status/bulk', {
      ids,
      status,
    });
    return response.data.data;
  },
};

export default exerciseService;
