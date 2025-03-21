// src/api/muscleService.ts
import apiClient from './client';

export interface Muscle {
  id: string;
  name: string;
  commonName: string | null;
  description: string | null;
  muscleGroupId: string;
  muscleGroup?: MuscleGroup;
  svgUrl: string | null;
}

export interface MuscleGroup {
  id: string;
  name: string;
  category: 'upper_body' | 'lower_body' | 'core';
  description: string | null;
  parentGroupId: string | null;
  muscles?: Muscle[];
}

export interface MuscleFilterParams {
  muscleGroupId?: string;
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

export const muscleService = {
  // Get muscles with pagination and filters
  getMusclesWithPagination: async (
    params: MuscleFilterParams = {}
  ): Promise<PaginatedResponse<Muscle>> => {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/muscles?${queryParams.toString()}`);
    return response.data;
  },

  // Get all muscles (for dropdowns, etc.)
  getMuscles: async (groupId?: string): Promise<Muscle[]> => {
    const url = groupId ? `/muscles/group/${groupId}` : '/muscles';
    const response = await apiClient.get(url);
    return response.data.data || [];
  },

  // Get a single muscle by ID
  getMuscle: async (id: string): Promise<Muscle> => {
    const response = await apiClient.get(`/muscles/${id}`);
    return response.data.data;
  },

  // Get all muscle groups
  getMuscleGroups: async (parentOnly = false): Promise<MuscleGroup[]> => {
    const url = `/muscles/groups${parentOnly ? '?parentOnly=true' : ''}`;
    const response = await apiClient.get(url);
    return response.data.data || [];
  },

  // Get a single muscle group by ID
  getMuscleGroup: async (id: string): Promise<MuscleGroup> => {
    const response = await apiClient.get(`/muscles/groups/${id}`);
    return response.data.data;
  },

  // Get muscle group hierarchy
  getMuscleGroupHierarchy: async (): Promise<MuscleGroup[]> => {
    const response = await apiClient.get('/muscles/groups/hierarchy');
    return response.data.data || [];
  },

  // Create a muscle
  createMuscle: async (muscle: Partial<Muscle>): Promise<Muscle> => {
    const response = await apiClient.post('/muscles', muscle);
    return response.data.data;
  },

  // Update a muscle
  updateMuscle: async (
    id: string,
    muscle: Partial<Muscle>
  ): Promise<Muscle> => {
    const response = await apiClient.put(`/muscles/${id}`, muscle);
    return response.data.data;
  },

  // Delete a muscle
  deleteMuscle: async (id: string): Promise<void> => {
    await apiClient.delete(`/muscles/${id}`);
  },

  // Create a muscle group
  createMuscleGroup: async (
    group: Partial<MuscleGroup>
  ): Promise<MuscleGroup> => {
    const response = await apiClient.post('/muscles/groups', group);
    return response.data.data;
  },

  // Update a muscle group
  updateMuscleGroup: async (
    id: string,
    group: Partial<MuscleGroup>
  ): Promise<MuscleGroup> => {
    const response = await apiClient.put(`/muscles/groups/${id}`, group);
    return response.data.data;
  },

  // Delete a muscle group
  deleteMuscleGroup: async (id: string): Promise<void> => {
    await apiClient.delete(`/muscles/groups/${id}`);
  },

  // Create a muscle with SVG
  createMuscleWithSvg: async (formData: FormData): Promise<Muscle> => {
    // console.log('FormData contents:');
    // for (const pair of formData.entries()) {
    //   console.log(pair[0], ':', pair[1]);
    // }
    const response = await apiClient.post('/muscles/with-svg', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Update a muscle with SVG
  // updateMuscleWithSvg: async (
  //   id: string,
  //   formData: FormData
  // ): Promise<Muscle> => {
  //   const response = await apiClient.put(`/muscles/${id}`, formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data',
  //     },
  //   });
  //   return response.data.data;
  // },

  // Update a muscle with SVG
  updateMuscleWithSvg: async (
    id: string,
    formData: FormData
  ): Promise<Muscle> => {
    // Debug: Log FormData contents
    // console.log('FormData contents for update:');
    // for (const pair of formData.entries()) {
    //   console.log(pair[0], ':', pair[1]);
    // }

    // Let Axios set the correct Content-Type with boundary
    const response = await apiClient.put(`/muscles/${id}/with-svg`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Don't use transformRequest here as it can interfere with FormData processing
    });
    return response.data.data;
  },
};

export default muscleService;
