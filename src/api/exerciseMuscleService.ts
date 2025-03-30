// src/api/exerciseMuscleService.ts
import apiClient from './client';
import { MuscleTarget } from './muscleService';

export interface CreateMuscleTargetPayload {
  exerciseId: string;
  muscleId: string;
  role: 'primary' | 'secondary' | 'synergist' | 'stabilizer';
  activationPercentage?: number;
  activationMap?: {
    regions: Array<{
      area: 'upper' | 'middle' | 'lower';
      activation_level: 'high' | 'medium' | 'low';
      percentage: number;
    }>;
    emg_data?: {
      peak: number;
      mean: number;
      study_reference?: string;
    };
  };
}

export const exerciseMuscleService = {
  // Get muscle targets for an exercise
  getMuscleTargets: async (exerciseId: string): Promise<MuscleTarget[]> => {
    // This route matches the backend route in the routes file:
    // "/:id/muscles" for getExerciseMuscles
    const response = await apiClient.get(`/exercises/${exerciseId}/muscles`);
    console.log(response.data.data, 'sss');
    return response.data.data || [];
  },

  // Create a muscle target
  createMuscleTarget: async (
    payload: CreateMuscleTargetPayload
  ): Promise<MuscleTarget> => {
    // This route matches the backend route:
    // "/muscles/targets" for createMuscleTarget
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
    // This route matches the backend route:
    // "/muscles/targets/bulk" for bulkCreateTargets
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
    // This route matches the backend route:
    // "/muscles/targets/:id" for updateMuscleTarget
    const response = await apiClient.put(
      `/exercises/muscles/targets/${targetId}`,
      payload
    );
    return response.data.data;
  },

  // Delete a muscle target
  deleteMuscleTarget: async (targetId: string): Promise<void> => {
    // This route matches the backend route:
    // "/muscles/targets/:id" for deleteMuscleTarget
    await apiClient.delete(`/exercises/muscles/targets/${targetId}`);
  },

  // Get muscle targeting statistics
  getMuscleTargetStats: async (exerciseId: string): Promise<any> => {
    // This route matches the backend route:
    // "/:id/targeting" for getTargetingProfile
    const response = await apiClient.get(`/exercises/${exerciseId}/targeting`);
    return response.data.data;
  },

  // Get primary muscles for an exercise
  getPrimaryMuscles: async (exerciseId: string): Promise<MuscleTarget[]> => {
    // This route matches the backend route:
    // "/:id/muscles/primary" for getPrimaryMuscles
    const response = await apiClient.get(
      `/exercises/${exerciseId}/muscles/primary`
    );
    return response.data.data || [];
  },

  // Get secondary muscles for an exercise
  getSecondaryMuscles: async (exerciseId: string): Promise<MuscleTarget[]> => {
    // This route matches the backend route:
    // "/:id/muscles/secondary" for getSecondaryMuscles
    const response = await apiClient.get(
      `/exercises/${exerciseId}/muscles/secondary`
    );
    return response.data.data || [];
  },
};

export default exerciseMuscleService;
