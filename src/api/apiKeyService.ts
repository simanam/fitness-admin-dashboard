// src/api/apiKeyService.ts
import apiClient from './client';

export interface ApiKey {
  id: string;
  clientId: string;
  apiKey: string;
  apiSecret?: string;
  keyType: 'primary' | 'rotated' | 'temporary';
  name: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
  revokedReason?: string;
}

export interface ApiKeyFilterParams {
  keyType?: 'primary' | 'rotated' | 'temporary';
  active?: boolean;
  page?: number;
  per_page?: number;
}

export interface CreateKeyParams {
  keyType: 'primary' | 'rotated' | 'temporary';
  name: string;
  expiresIn?: number; // in milliseconds
}

export const apiKeyService = {
  // Get API keys for a client
  getApiKeys: async (
    clientId: string,
    params: ApiKeyFilterParams = {}
  ): Promise<ApiKey[]> => {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await apiClient.get(
      `/clients/${clientId}/keys?${queryParams.toString()}`
    );
    return response.data.data || [];
  },

  // Create API key
  createApiKey: async (
    clientId: string,
    params: CreateKeyParams
  ): Promise<ApiKey> => {
    const response = await apiClient.post(`/clients/${clientId}/keys`, params);
    return response.data.data;
  },

  // Revoke API key
  revokeApiKey: async (
    clientId: string,
    keyId: string,
    reason: string
  ): Promise<ApiKey> => {
    const response = await apiClient.post(
      `/clients/${clientId}/keys/${keyId}/revoke`,
      { reason }
    );
    return response.data.data;
  },

  // Rotate API key
  rotateApiKey: async (clientId: string, keyId: string): Promise<ApiKey> => {
    const response = await apiClient.post(
      `/clients/${clientId}/keys/${keyId}/rotate`
    );
    return response.data.data;
  },
};

export default apiKeyService;
