// src/api/movementPatternService.ts
import apiClient from './client';

export interface MovementPattern {
  id: string;
  name: string;
  patternType: string;
  category: string;
  description: string | null;
}

export interface MovementPatternFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  patternType?: string;
  category?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: {
    items: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  success: boolean;
  message: string;
}

const movementPatternService = {
  // Get movement patterns with pagination and filters
  getMovementPatterns: async (
    params: MovementPatternFilterParams = {}
  ): Promise<PaginatedResponse<MovementPattern>> => {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await apiClient.get(
      `/movement-patterns?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get a single movement pattern by ID
  getMovementPattern: async (id: string): Promise<MovementPattern> => {
    const response = await apiClient.get(`/movement-patterns/${id}`);
    return response.data.data;
  },

  // Create a new movement pattern
  createMovementPattern: async (
    pattern: Partial<MovementPattern>
  ): Promise<MovementPattern> => {
    const response = await apiClient.post('/movement-patterns', pattern);
    return response.data.data;
  },

  // Update an existing movement pattern
  updateMovementPattern: async (
    id: string,
    pattern: Partial<MovementPattern>
  ): Promise<MovementPattern> => {
    const response = await apiClient.put(`/movement-patterns/${id}`, pattern);
    return response.data.data;
  },

  // Delete a movement pattern
  deleteMovementPattern: async (id: string): Promise<void> => {
    await apiClient.delete(`/movement-patterns/${id}`);
  },

  // Get patterns by category
  getPatternsByCategory: async (
    category: string
  ): Promise<MovementPattern[]> => {
    const response = await apiClient.get(
      `/movement-patterns/category/${category}`
    );
    return response.data.data;
  },

  // Get patterns by type
  getPatternsByType: async (type: string): Promise<MovementPattern[]> => {
    const response = await apiClient.get(`/movement-patterns/type/${type}`);
    return response.data.data;
  },

  // Get patterns by category and type
  getPatternsByCategoryAndType: async (
    category: string,
    type: string
  ): Promise<MovementPattern[]> => {
    const response = await apiClient.get(
      `/movement-patterns/category/${category}/type/${type}`
    );
    return response.data.data;
  },

  // Get related patterns
  getRelatedPatterns: async (id: string): Promise<MovementPattern[]> => {
    const response = await apiClient.get(`/movement-patterns/${id}/related`);
    return response.data.data;
  },

  // Get pattern summary
  getPatternSummary: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/movement-patterns/${id}/summary`);
    return response.data.data;
  },

  // Get category distribution
  getCategoryDistribution: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get(
      '/movement-patterns/categories/distribution'
    );
    return response.data.data;
  },

  // Get type distribution
  getTypeDistribution: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get(
      '/movement-patterns/types/distribution'
    );
    return response.data.data;
  },
};

export default movementPatternService;
