// src/api/exerciseService.ts
import apiClient from './client';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  movement_pattern: string;
  mechanics: 'compound' | 'isolation';
  force: 'push' | 'pull' | 'carry' | 'static';
  equipment_required: boolean;
  status: 'draft' | 'published' | 'archived';
  bilateral: boolean;
  plane_of_motion: string;
  setup_position?: string;
  form_points?: {
    setup: string[];
    execution: string[];
    breathing: string[];
    alignment: string[];
  };
  common_mistakes?: {
    mistakes: Array<{
      description: string;
      correction: string;
      risk_level: string;
    }>;
  };
  safety_info?: {
    risk_level: string;
    contraindications: any[];
    precautions: string[];
    warning_signs: string[];
  };
  tempo_recommendations?: {
    default: string;
    variations?: any[];
  };
  created_at: string;
  updated_at: string;
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
  order?: 'asc' | 'desc';
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
        queryParams.append(key, String(value));
      }
    });

    const response = await apiClient.get(
      `/exercises?${queryParams.toString()}`
    );

    return response.data;
  },

  // Get a single exercise by ID
  getExercise: async (id: string): Promise<Exercise> => {
    const response = await apiClient.get(`/exercises/${id}`);
    return response.data.data;
  },

  // Create a new exercise
  createExercise: async (exercise: Partial<Exercise>): Promise<Exercise> => {
    // Transform any uppercase enum values to lowercase to match backend
    const transformedExercise = {
      ...exercise,
      difficulty: exercise.difficulty?.toLowerCase(),
      mechanics: exercise.mechanics?.toLowerCase(),
      force: exercise.force?.toLowerCase(),
      status: exercise.status?.toLowerCase(),
      plane_of_motion: exercise.plane_of_motion?.toLowerCase(),
      movement_pattern: exercise.movement_pattern?.toLowerCase(),
    };

    const response = await apiClient.post('/exercises', transformedExercise);
    return response.data.data;
  },

  // Create exercise with media
  createExerciseWithMedia: async (
    exerciseData: Partial<Exercise>,
    mediaFiles: File[],
    mediaMetadata: any[]
  ): Promise<Exercise> => {
    const formData = new FormData();

    // Add exercise data as JSON string
    formData.append(
      'exerciseData',
      JSON.stringify({
        ...exerciseData,
        difficulty: exerciseData.difficulty?.toLowerCase(),
        mechanics: exerciseData.mechanics?.toLowerCase(),
        force: exerciseData.force?.toLowerCase(),
        status: exerciseData.status?.toLowerCase(),
        plane_of_motion: exerciseData.plane_of_motion?.toLowerCase(),
        movement_pattern: exerciseData.movement_pattern?.toLowerCase(),
      })
    );

    // Add media files
    mediaFiles.forEach((file, index) => {
      formData.append(`files[]`, file);
    });

    // Add media metadata
    formData.append('videoMetadata', JSON.stringify(mediaMetadata));

    const response = await apiClient.post('/exercises/with-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  // Update an existing exercise
  updateExercise: async (
    id: string,
    exercise: Partial<Exercise>
  ): Promise<Exercise> => {
    // Transform any uppercase enum values to lowercase to match backend
    const transformedExercise = {
      ...exercise,
      difficulty: exercise.difficulty?.toLowerCase(),
      mechanics: exercise.mechanics?.toLowerCase(),
      force: exercise.force?.toLowerCase(),
      status: exercise.status?.toLowerCase(),
      plane_of_motion: exercise.plane_of_motion?.toLowerCase(),
      movement_pattern: exercise.movement_pattern?.toLowerCase(),
    };

    const response = await apiClient.put(
      `/exercises/${id}`,
      transformedExercise
    );
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
    const response = await apiClient.put(`/exercises/${id}/status`, {
      status: status.toLowerCase(),
    });
    return response.data.data;
  },

  // Bulk update exercise status
  bulkUpdateStatus: async (
    ids: string[],
    status: string
  ): Promise<{ updatedCount: number }> => {
    const response = await apiClient.post('/exercises/status/bulk', {
      ids,
      status: status.toLowerCase(),
    });
    return response.data.data;
  },

  // Publish an exercise
  publishExercise: async (id: string): Promise<Exercise> => {
    const response = await apiClient.post(`/exercises/${id}/publish`);
    return response.data.data;
  },

  // Archive an exercise
  archiveExercise: async (id: string): Promise<Exercise> => {
    const response = await apiClient.post(`/exercises/${id}/archive`);
    return response.data.data;
  },

  // Find similar exercises
  findSimilarExercises: async (id: string, limit = 5): Promise<Exercise[]> => {
    const response = await apiClient.get(
      `/exercises/${id}/similar?limit=${limit}`
    );
    return response.data.data;
  },
};

export default exerciseService;
