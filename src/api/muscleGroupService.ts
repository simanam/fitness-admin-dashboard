// src/api/muscleGroupService.ts
import apiClient from './client';
import { MuscleGroup } from './muscleService';

export interface MuscleGroupHierarchyItem extends MuscleGroup {
  children: MuscleGroupHierarchyItem[];
}

export const muscleGroupService = {
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
  getMuscleGroupHierarchy: async (): Promise<MuscleGroupHierarchyItem[]> => {
    const response = await apiClient.get('/muscles/groups/hierarchy');
    return response.data.data || [];
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

  // Move a muscle group to a new parent
  moveMuscleGroup: async (
    id: string,
    newParentId: string | null
  ): Promise<MuscleGroup> => {
    const response = await apiClient.put(`/muscles/groups/${id}/move`, {
      newParentId,
    });
    return response.data.data;
  },

  // Reorder muscle groups
  reorderMuscleGroups: async (
    reorderData: { id: string; order: number }[]
  ): Promise<void> => {
    await apiClient.put('/muscles/groups/order', reorderData);
  },
};

export default muscleGroupService;
