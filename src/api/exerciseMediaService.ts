// src/api/exerciseMediaService.ts
import apiClient from './client';

export interface ExerciseMedia {
  id: string;
  exerciseId: string;
  mediaType: 'VIDEO' | 'IMAGE' | 'SVG';
  url: string;
  viewAngle: 'FRONT' | 'SIDE' | 'REAR' | 'ANGLE';
  isPrimary: boolean;
  duration?: number;
  format?: string;
  title?: string;
  order: number;
  urls?: {
    original: string;
    thumbnail: string;
    preview: string;
    fullsize: string;
  };
}

export interface MediaCompletenessCheck {
  isComplete: boolean;
  missingAngles: string[];
  missingTypes: string[];
  recommendations: string[];
}

export interface MediaStats {
  totalCount: number;
  byType: {
    VIDEO: number;
    IMAGE: number;
    SVG: number;
  };
  byViewAngle: {
    FRONT: number;
    SIDE: number;
    REAR: number;
    ANGLE: number;
  };
  totalDuration: number;
  totalSize: number;
}

export const exerciseMediaService = {
  // Get media for an exercise
  getExerciseMedia: async (exerciseId: string): Promise<ExerciseMedia[]> => {
    const response = await apiClient.get(`/exercises/${exerciseId}/media`);
    return response.data.data.media || [];
  },

  // Upload media
  uploadMedia: async (
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ExerciseMedia> => {
    const response = await apiClient.post('/exercises/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });
    return response.data.data.media;
  },

  // Delete media
  deleteMedia: async (mediaId: string): Promise<void> => {
    await apiClient.delete(`/exercises/media/${mediaId}`);
  },

  // Set primary media
  setPrimaryMedia: async (mediaId: string): Promise<ExerciseMedia> => {
    const response = await apiClient.put(`/exercises/media/${mediaId}/primary`);
    return response.data.data;
  },

  // Update media view angle
  updateMediaViewAngle: async (
    mediaId: string,
    viewAngle: string
  ): Promise<ExerciseMedia> => {
    const response = await apiClient.put(`/exercises/media/${mediaId}`, {
      viewAngle,
    });
    return response.data.data;
  },

  // Reorder media
  reorderMedia: async (
    exerciseId: string,
    mediaOrder: { id: string; order: number }[]
  ): Promise<void> => {
    await apiClient.put(`/exercises/${exerciseId}/media/order`, mediaOrder);
  },

  // Check media completeness
  checkMediaCompleteness: async (
    exerciseId: string
  ): Promise<MediaCompletenessCheck> => {
    const response = await apiClient.get(
      `/exercises/${exerciseId}/media/completeness`
    );
    return response.data.data;
  },

  // Get media statistics
  getMediaStats: async (exerciseId: string): Promise<MediaStats> => {
    const response = await apiClient.get(
      `/exercises/${exerciseId}/media/stats`
    );
    return response.data.data;
  },
};

export default exerciseMediaService;
