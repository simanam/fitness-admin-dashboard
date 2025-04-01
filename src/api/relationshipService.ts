// src/api/relationshipService.ts
import apiClient from './client';
import { Exercise } from './exerciseService';

export interface ExerciseRelationship {
  id: string;
  baseExerciseId: string;
  relatedExerciseId: string;
  relationshipType: 'progression' | 'variation' | 'alternative';
  difficultyChange: number;
  bidirectional: boolean;
  modificationDetails?: {
    setupChanges: string;
    techniqueChanges: string;
    targetMuscleImpact: string;
  };
  baseExercise?: Exercise;
  relatedExercise?: Exercise;
}

export interface ProgressionRelationship extends ExerciseRelationship {
  baseExercise: Exercise;
  relatedExercise: Exercise;
}

export interface ProgressionPath {
  easier: ProgressionRelationship[];
  harder: ProgressionRelationship[];
}

export interface CreateRelationshipPayload {
  baseExerciseId: string;
  relatedExerciseId: string;
  relationshipType: 'progression' | 'variation' | 'alternative';
  difficultyChange?: number;
  bidirectional?: boolean;
  modificationDetails?: {
    setupChanges: string;
    techniqueChanges: string;
    targetMuscleImpact: string;
  };
}

export const relationshipService = {
  // Get relationships for an exercise
  getExerciseRelationships: async (
    exerciseId: string
  ): Promise<ExerciseRelationship[]> => {
    const response = await apiClient.get(
      `/exercises/relationships?baseExerciseId=${exerciseId}`
    );
    return response.data.data || [];
  },

  // Get progression path
  getProgressionPath: async (exerciseId: string): Promise<ProgressionPath> => {
    const response = await apiClient.get(
      `/exercises/${exerciseId}/progression`
    );
    return response.data.data || { easier: [], harder: [] };
  },

  // Get variations
  getVariations: async (
    exerciseId: string
  ): Promise<ExerciseRelationship[]> => {
    const response = await apiClient.get(`/exercises/${exerciseId}/variations`);
    return response.data.data || [];
  },

  // Create a relationship
  createRelationship: async (
    payload: CreateRelationshipPayload
  ): Promise<ExerciseRelationship> => {
    const response = await apiClient.post('/exercises/relationships', payload);
    return response.data.data;
  },

  // Delete a relationship
  deleteRelationship: async (relationshipId: string): Promise<void> => {
    await apiClient.delete(`/exercises/relationships/${relationshipId}`);
  },

  // Update a relationship
  updateRelationship: async (
    relationshipId: string,
    payload: Partial<CreateRelationshipPayload>
  ): Promise<ExerciseRelationship> => {
    const response = await apiClient.put(
      `/exercises/relationships/${relationshipId}`,
      payload
    );
    return response.data.data;
  },

  // Find similar exercises
  findSimilarExercises: async (
    exerciseId: string,
    limit = 5
  ): Promise<Exercise[]> => {
    const response = await apiClient.get(
      `/exercises/${exerciseId}/similar?limit=${limit}`
    );
    return response.data.data || [];
  },
};

export default relationshipService;
