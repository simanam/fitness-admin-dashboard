// src/api/exerciseMediaService.ts
import apiClient from './client';

export interface ExerciseMedia {
  id: string;
  exerciseId: string;
  mediaType: 'video' | 'image' | 'svg';
  url: string;
  viewAngle: 'front' | 'side' | 'rear' | 'angle';
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

// Cache mechanism to reduce duplicate API calls
const cache = {
  media: new Map<string, { data: ExerciseMedia[]; timestamp: number }>(),
  stats: new Map<string, { data: MediaStats; timestamp: number }>(),
  completeness: new Map<
    string,
    { data: MediaCompletenessCheck; timestamp: number }
  >(),
  // Cache expiration time: 30 seconds
  expirationTime: 30 * 1000,
};

// Clear cache for a specific exercise
const clearExerciseCache = (exerciseId: string) => {
  cache.media.delete(exerciseId);
  cache.stats.delete(exerciseId);
  cache.completeness.delete(exerciseId);
};

// Rate limit tracking
let pendingRequests = 0;
const maxConcurrentRequests = 2;
const requestQueue: Array<() => Promise<any>> = [];

// Queue mechanism for API requests
const queueRequest = <T>(fn: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    const executeRequest = async () => {
      pendingRequests++;
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        pendingRequests--;
        if (
          requestQueue.length > 0 &&
          pendingRequests < maxConcurrentRequests
        ) {
          const nextRequest = requestQueue.shift();
          if (nextRequest) nextRequest();
        }
      }
    };

    if (pendingRequests < maxConcurrentRequests) {
      executeRequest();
    } else {
      requestQueue.push(executeRequest);
    }
  });
};

// Improved retry with backoff that uses the queue
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let retries = 0;

  const attempt = async (): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (error.response && error.response.status === 429) {
        retries++;
        if (retries >= maxRetries) throw error;

        // Exponential backoff with jitter to avoid thundering herd
        const jitter = Math.random() * 500;
        const delay = initialDelay * Math.pow(2, retries) + jitter;
        console.log(
          `Rate limited, retrying in ${Math.round(delay)}ms (attempt ${retries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return attempt();
      } else {
        throw error;
      }
    }
  };

  return queueRequest(attempt);
};

export const exerciseMediaService = {
  // Get media for an exercise
  getExerciseMedia: async (exerciseId: string): Promise<ExerciseMedia[]> => {
    // Check cache first
    const cachedMedia = cache.media.get(exerciseId);
    if (
      cachedMedia &&
      Date.now() - cachedMedia.timestamp < cache.expirationTime
    ) {
      return cachedMedia.data;
    }

    return retryWithBackoff(async () => {
      const response = await apiClient.get(`/exercises/${exerciseId}/media`);
      const mediaData = response.data.data.media || [];

      // Update cache
      cache.media.set(exerciseId, {
        data: mediaData,
        timestamp: Date.now(),
      });

      return mediaData;
    });
  },

  // Upload media
  uploadMedia: async (
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ExerciseMedia> => {
    // Clear cache for this exercise when uploading new media
    console.log('--- FormData Contents ---');
    for (const pair of formData.entries()) {
      const [key, value] = pair;
      if (value instanceof File) {
        console.log(`${key}: File object`, {
          name: value.name,
          type: value.type,
          size: value.size,
          lastModified: new Date(value.lastModified).toISOString(),
        });
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    const exerciseId = formData.get('exerciseId') as string;
    if (exerciseId) {
      clearExerciseCache(exerciseId);
    }

    // No retry for uploads - just queue them
    return queueRequest(async () => {
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
    });
  },

  // Delete media
  deleteMedia: async (mediaId: string): Promise<void> => {
    // We don't know which exercise this media belongs to, so clear specific media when provided
    return queueRequest(async () => {
      const response = await apiClient.delete(`/exercises/media/${mediaId}`);
      // If the response includes the exerciseId, clear that cache
      if (response.data?.data?.exerciseId) {
        clearExerciseCache(response.data.data.exerciseId);
      }
    });
  },

  // Set primary media
  setPrimaryMedia: async (mediaId: string): Promise<ExerciseMedia> => {
    return queueRequest(async () => {
      const response = await apiClient.put(
        `/exercises/media/${mediaId}/primary`
      );
      // If the response includes the exerciseId, clear that cache
      if (response.data?.data?.exerciseId) {
        clearExerciseCache(response.data.data.exerciseId);
      }
      return response.data.data;
    });
  },

  // Update media view angle
  updateMediaViewAngle: async (
    mediaId: string,
    viewAngle: string
  ): Promise<ExerciseMedia> => {
    return queueRequest(async () => {
      const response = await apiClient.put(`/exercises/media/${mediaId}`, {
        viewAngle,
      });
      // If the response includes the exerciseId, clear that cache
      if (response.data?.data?.exerciseId) {
        clearExerciseCache(response.data.data.exerciseId);
      }
      return response.data.data;
    });
  },

  // Reorder media
  reorderMedia: async (
    exerciseId: string,
    mediaOrder: { id: string; order: number }[]
  ): Promise<void> => {
    // Clear cache for this exercise
    clearExerciseCache(exerciseId);

    return queueRequest(async () => {
      await apiClient.put(`/exercises/${exerciseId}/media/order`, mediaOrder);
    });
  },

  // Check media completeness
  checkMediaCompleteness: async (
    exerciseId: string
  ): Promise<MediaCompletenessCheck> => {
    // Check cache first
    const cachedCompleteness = cache.completeness.get(exerciseId);
    if (
      cachedCompleteness &&
      Date.now() - cachedCompleteness.timestamp < cache.expirationTime
    ) {
      return cachedCompleteness.data;
    }

    return retryWithBackoff(async () => {
      const response = await apiClient.get(
        `/exercises/${exerciseId}/media/completeness`
      );
      const completenessData = response.data.data;

      // Update cache
      cache.completeness.set(exerciseId, {
        data: completenessData,
        timestamp: Date.now(),
      });

      return completenessData;
    });
  },

  // Get media statistics
  getMediaStats: async (exerciseId: string): Promise<MediaStats> => {
    // Check cache first
    const cachedStats = cache.stats.get(exerciseId);
    if (
      cachedStats &&
      Date.now() - cachedStats.timestamp < cache.expirationTime
    ) {
      return cachedStats.data;
    }

    return retryWithBackoff(async () => {
      const response = await apiClient.get(
        `/exercises/${exerciseId}/media/stats`
      );
      const statsData = response.data.data;

      // Update cache
      cache.stats.set(exerciseId, {
        data: statsData,
        timestamp: Date.now(),
      });

      return statsData;
    });
  },
};

export default exerciseMediaService;
