// src/api/clientService.ts
import apiClient from './client';

export interface Client {
  id: string;
  name: string;
  email: string;
  companyName: string;
  description?: string;
  accountOwner?: string;
  contactPhone?: string;
  technicalContactEmail?: string;
  billingEmail?: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  monthlyQuota?: number;
  rateLimit?: number;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt?: string;
  suspendedAt?: string;
  suspendedReason?: string;
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

export interface ClientFilterParams {
  status?: string;
  tier?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ClientStatistics {
  totalRequests: number;
  monthlyAverage: number;
  activeKeys: number;
}

export interface ClientTierStats {
  free: number;
  basic: number;
  premium: number;
  enterprise: number;
}

export const clientService = {
  // Get clients with pagination and filters
  getClients: async (
    params: ClientFilterParams = {}
  ): Promise<PaginatedResponse<Client>> => {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/clients?${queryParams.toString()}`);
    return response.data;
  },

  // Get a single client by ID
  getClient: async (id: string): Promise<Client> => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data.data;
  },

  // Create a new client
  createClient: async (client: Partial<Client>): Promise<Client> => {
    const response = await apiClient.post('/clients', client);
    return response.data.data;
  },

  // Update an existing client
  updateClient: async (
    id: string,
    client: Partial<Client>
  ): Promise<Client> => {
    const response = await apiClient.put(`/clients/${id}`, client);
    return response.data.data;
  },

  // Update client status
  updateClientStatus: async (
    id: string,
    status: string,
    reason?: string
  ): Promise<Client> => {
    const response = await apiClient.put(`/clients/${id}/status`, {
      status,
      reason,
    });
    return response.data.data;
  },

  // Update client tier
  updateClientTier: async (id: string, tier: string): Promise<Client> => {
    const response = await apiClient.put(`/clients/${id}/tier`, {
      tier,
    });
    return response.data.data;
  },

  // Suspend client
  suspendClient: async (id: string, reason: string): Promise<Client> => {
    const response = await apiClient.post(`/clients/${id}/suspend`, {
      reason,
    });
    return response.data.data;
  },

  // Reactivate client
  reactivateClient: async (id: string): Promise<Client> => {
    const response = await apiClient.post(`/clients/${id}/reactivate`);
    return response.data.data;
  },

  // Get client statistics
  getClientStatistics: async (id: string): Promise<ClientStatistics> => {
    const response = await apiClient.get(`/clients/${id}/stats`);
    return response.data.data;
  },

  // Get active clients by tier
  getClientsByTier: async (): Promise<ClientTierStats> => {
    const response = await apiClient.get(`/clients/stats/by-tier`);
    return response.data.data;
  },
};

export default clientService;
