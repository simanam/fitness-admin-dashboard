// src/api/exerciseMuscleService.ts
import apiClient from './client';
import { MuscleTarget } from './muscleService';

export interface CreateMuscleTargetPayload {
  exerciseId: string;
  muscleId: string;
  role: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  activationPercentage: number;
}

export const exerciseMuscleService = {
  // Get muscle targets for an exercise
  getMuscleTargets: async (exerciseId: string): Promise<MuscleTarget[]> => {
    const response = await apiClient.get(`/exercises/${exerciseId}/muscles`);
    return response.data.data || [];
  },

  // Create a muscle target
  createMuscleTarget: async (
    payload: CreateMuscleTargetPayload
  ): Promise<MuscleTarget> => {
    const response = await apiClient.post(
      '/exercises/muscles/targets',
      payload
    );
    return response.data.data;
  },

  // Bulk create muscle targets
  bulkCreateMuscleTargets: async (
    exerciseId: string,
    targets: Omit<CreateMuscleTargetPayload, 'exerciseId'>[]
  ): Promise<MuscleTarget[]> => {
    const response = await apiClient.post('/exercises/muscles/targets/bulk', {
      exerciseId,
      targets,
    });
    return response.data.data;
  },

  // Update a muscle target
  updateMuscleTarget: async (
    targetId: string,
    payload: Partial<Omit<CreateMuscleTargetPayload, 'exerciseId' | 'muscleId'>>
  ): Promise<MuscleTarget> => {
    const response = await apiClient.put(
      `/exercises/muscles/targets/${targetId}`,
      payload
    );
    return response.data.data;
  },

  // Delete a muscle target
  deleteMuscleTarget: async (targetId: string): Promise<void> => {
    await apiClient.delete(`/exercises/muscles/targets/${targetId}`);
  },
};

export default exerciseMuscleService;
