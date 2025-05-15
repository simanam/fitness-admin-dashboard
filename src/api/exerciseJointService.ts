// src/api/exerciseJointService.ts

import apiClient from './client';
import type { Joint } from './jointService';

export interface JointInvolvement {
  id: string;
  exerciseId: string;
  jointId: string;
  movementType: string;
  romRequired: number;
  isPrimary: boolean;
  movementNotes: string | null;
  createdAt: string;
  updatedAt: string;
  joint?: Joint;
}

export interface JointInvolvementResponse {
  primary: JointInvolvement[];
  all: JointInvolvement[];
}

export interface CreateJointInvolvementPayload {
  exerciseId: string;
  jointId: string;
  movementType: string;
  isPrimary: boolean;
  romRequired: number;
  movementNotes?: string;
}

export const exerciseJointService = {
  // Get all joint involvements (with optional filters)
  getAllJointInvolvements: async (
    filters = {}
  ): Promise<JointInvolvement[]> => {
    const response = await apiClient.get('/exercises/joints/involvements', {
      params: filters,
    });
    return response.data.data || [];
  },

  // Get joint involvements for an exercise
  getJointInvolvements: async (
    exerciseId: string
  ): Promise<JointInvolvementResponse> => {
    const response = await apiClient.get(`/exercises/${exerciseId}/joints`);
    return response.data.data || { primary: [], all: [] };
  },

  // Create a joint involvement
  createJointInvolvement: async (
    payload: CreateJointInvolvementPayload
  ): Promise<JointInvolvement> => {
    const response = await apiClient.post(
      '/exercises/joints/involvements',
      payload
    );
    return response.data.data;
  },

  // Update a joint involvement
  updateJointInvolvement: async (
    involvementId: string,
    payload: Partial<
      Omit<CreateJointInvolvementPayload, 'exerciseId' | 'jointId'>
    >
  ): Promise<JointInvolvement> => {
    const response = await apiClient.put(
      `/exercises/joints/involvements/${involvementId}`,
      payload
    );
    return response.data.data;
  },

  // Delete a joint involvement
  deleteJointInvolvement: async (involvementId: string): Promise<void> => {
    await apiClient.delete(`/exercises/joints/involvements/${involvementId}`);
  },

  // Bulk create joint involvements
  bulkCreateJointInvolvements: async (
    exerciseId: string,
    involvements: Omit<CreateJointInvolvementPayload, 'exerciseId'>[]
  ): Promise<JointInvolvement[]> => {
    const response = await apiClient.post(
      '/exercises/joints/involvements/bulk',
      {
        exerciseId,
        involvements,
      }
    );
    return response.data.data;
  },

  // Get primary joints for an exercise
  getPrimaryJoints: async (exerciseId: string): Promise<JointInvolvement[]> => {
    const response = await apiClient.get(
      `/exercises/${exerciseId}/joints/primary`
    );
    return response.data.data || [];
  },

  // Get ROM analysis for an exercise
  getRomAnalysis: async (
    exerciseId: string
  ): Promise<Record<string, unknown>> => {
    const response = await apiClient.get(`/exercises/${exerciseId}/rom`);
    return response.data.data;
  },

  // Get movement profile for an exercise
  getMovementProfile: async (
    exerciseId: string
  ): Promise<Record<string, unknown>> => {
    const response = await apiClient.get(
      `/exercises/${exerciseId}/movement-profile`
    );
    return response.data.data;
  },

  // Validate movement requirements
  validateMovementRequirements: async (
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const response = await apiClient.post('/exercises/joints/validate', data);
    return response.data.data;
  },
};

export default exerciseJointService;
