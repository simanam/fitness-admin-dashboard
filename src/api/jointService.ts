// src/api/jointService.ts
import apiClient from './client';

export interface Joint {
  id: string;
  name: string;
  type:
    | 'ball_and_socket'
    | 'hinge'
    | 'pivot'
    | 'ellipsoidal'
    | 'saddle'
    | 'gliding'
    | 'other';

  description: string | null;
  mobilityRange: {
    [key: string]: {
      // flexion, extension, abduction, etc.
      normal: {
        min: number;
        max: number;
        units: string;
      };
    };
  };
  movements: {
    primary: Array<{
      name: string;
      plane: string;
      range: {
        min: number;
        max: number;
        units: string;
      };
    }>;
    accessory: string[];
  };
}

export interface JointFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    totalPages: number;
  };
}

const jointService = {
  // Get joints with pagination and filtering
  getJoints: async (
    params: JointFilterParams = {}
  ): Promise<PaginatedResponse<Joint>> => {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    }

    const response = await apiClient.get(`/joints?${queryParams.toString()}`);

    return response.data;
  },

  // Get a single joint by ID
  getJoint: async (id: string): Promise<Joint> => {
    const response = await apiClient.get(`/joints/${id}`);
    return response.data.data;
  },

  // Create a new joint
  createJoint: async (joint: Partial<Joint>): Promise<Joint> => {
    const response = await apiClient.post('/joints', joint);
    return response.data.data;
  },

  // Update an existing joint
  updateJoint: async (id: string, joint: Partial<Joint>): Promise<Joint> => {
    const response = await apiClient.put(`/joints/${id}`, joint);
    return response.data.data;
  },

  // Delete a joint
  deleteJoint: async (id: string): Promise<void> => {
    await apiClient.delete(`/joints/${id}`);
  },

  // Get joints by type
  getJointsByType: async (type: string): Promise<Joint[]> => {
    const response = await apiClient.get(`/joints/type/${type}`);
    return response.data.data;
  },

  // Get joints by movement
  getJointsByMovement: async (movement: string): Promise<Joint[]> => {
    const response = await apiClient.get(`/joints/movement/${movement}`);
    return response.data.data;
  },

  // Update mobility range
  updateMobilityRange: async (
    id: string,
    mobilityRange: Joint['mobilityRange']
  ): Promise<Joint> => {
    const response = await apiClient.put(
      `/joints/${id}/mobility-range`,
      mobilityRange
    );
    return response.data.data;
  },

  // Update movements
  updateMovements: async (
    id: string,
    movements: Joint['movements']
  ): Promise<Joint> => {
    const response = await apiClient.put(`/joints/${id}/movements`, movements);
    return response.data.data;
  },

  // Get movement capabilities
  getMovementCapabilities: async (
    id: string
  ): Promise<{
    possibleMovements: string[];
    rangeOfMotion: Record<
      string,
      {
        min: number;
        max: number;
        units: string;
      }
    >;
  }> => {
    const response = await apiClient.get(`/joints/${id}/capabilities`);
    return response.data.data;
  },

  // Validate joint data
  validateJointData: async (
    jointData: Partial<Joint>
  ): Promise<{ isValid: boolean }> => {
    const response = await apiClient.post('/joints/validate', jointData);
    return response.data.data;
  },
};

export default jointService;
