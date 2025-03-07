// src/api/exerciseEquipmentService.ts
import apiClient from './client';
import { Equipment } from './equipmentService';

export interface EquipmentLink {
  id: string;
  exerciseId: string;
  equipmentId: string;
  isRequired: boolean;
  setupNotes?: string;
  order: number;
  equipment?: Equipment;
}

export interface CreateEquipmentLinkPayload {
  exerciseId: string;
  equipmentId: string;
  isRequired: boolean;
  setupNotes?: string;
}

export interface UpdateEquipmentLinkPayload {
  isRequired?: boolean;
  setupNotes?: string;
  order?: number;
}

export const exerciseEquipmentService = {
  // Get equipment links for an exercise
  getEquipmentLinks: async (exerciseId: string): Promise<EquipmentLink[]> => {
    const response = await apiClient.get(`/exercises/${exerciseId}/equipment`);

    // Merge required and optional equipment into a single array
    const required = response.data.data.required || [];
    const optional = response.data.data.optional || [];
    return [...required, ...optional];
  },

  // Create an equipment link
  createEquipmentLink: async (
    payload: CreateEquipmentLinkPayload
  ): Promise<EquipmentLink> => {
    const response = await apiClient.post('/exercises/equipment', payload);
    return response.data.data;
  },

  // Update an equipment link
  updateEquipmentLink: async (
    linkId: string,
    payload: UpdateEquipmentLinkPayload
  ): Promise<EquipmentLink> => {
    const response = await apiClient.put(
      `/exercises/equipment/${linkId}`,
      payload
    );
    return response.data.data;
  },

  // Delete an equipment link
  deleteEquipmentLink: async (linkId: string): Promise<void> => {
    await apiClient.delete(`/exercises/equipment/${linkId}`);
  },

  // Create multiple equipment links at once
  bulkCreateEquipmentLinks: async (
    exerciseId: string,
    links: Omit<CreateEquipmentLinkPayload, 'exerciseId'>[]
  ): Promise<EquipmentLink[]> => {
    const response = await apiClient.post('/exercises/equipment/bulk', {
      exerciseId,
      links,
    });
    return response.data.data;
  },

  // Update the order of equipment links
  updateOrder: async (
    exerciseId: string,
    orderData: { id: string; order: number }[]
  ): Promise<void> => {
    await apiClient.put(`/exercises/${exerciseId}/equipment/order`, orderData);
  },
};

export default exerciseEquipmentService;
