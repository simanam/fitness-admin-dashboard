// src/hooks/useApiKeys.ts
import { useState, useEffect } from 'react';
import { useToast } from './useToast';
import apiKeyService, {
  ApiKey,
  ApiKeyFilterParams,
  CreateKeyParams,
} from '../api/apiKeyService';

export const useApiKeys = (clientId: string) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyTypeFilter, setKeyTypeFilter] = useState<
    'primary' | 'rotated' | 'temporary' | ''
  >('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(
    undefined
  );
  const { showToast } = useToast();

  // Fetch API keys when dependencies change
  useEffect(() => {
    fetchApiKeys();
  }, [clientId, keyTypeFilter, activeFilter]);

  const fetchApiKeys = async () => {
    if (!clientId) return;

    setIsLoading(true);
    try {
      const params: ApiKeyFilterParams = {};
      if (keyTypeFilter) params.keyType = keyTypeFilter as any;
      if (activeFilter !== undefined) params.active = activeFilter;

      const keys = await apiKeyService.getApiKeys(clientId, params);
      setApiKeys(keys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch API keys. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async (params: CreateKeyParams) => {
    if (!clientId) return null;

    try {
      const newKey = await apiKeyService.createApiKey(clientId, params);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'API key created successfully',
      });
      await fetchApiKeys(); // Refresh the list
      return newKey;
    } catch (error) {
      console.error('Error creating API key:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create API key. Please try again.',
      });
      return null;
    }
  };

  const revokeApiKey = async (keyId: string, reason: string) => {
    if (!clientId) return false;

    try {
      await apiKeyService.revokeApiKey(clientId, keyId, reason);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'API key revoked successfully',
      });
      await fetchApiKeys(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error revoking API key:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to revoke API key. Please try again.',
      });
      return false;
    }
  };

  const rotateApiKey = async (keyId: string) => {
    if (!clientId) return null;

    try {
      const newKey = await apiKeyService.rotateApiKey(clientId, keyId);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'API key rotated successfully',
      });
      await fetchApiKeys(); // Refresh the list
      return newKey;
    } catch (error) {
      console.error('Error rotating API key:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to rotate API key. Please try again.',
      });
      return null;
    }
  };

  const handleKeyTypeFilterChange = (
    keyType: 'primary' | 'rotated' | 'temporary' | ''
  ) => {
    setKeyTypeFilter(keyType);
  };

  const handleActiveFilterChange = (active: boolean | undefined) => {
    setActiveFilter(active);
  };

  const clearFilters = () => {
    setKeyTypeFilter('');
    setActiveFilter(undefined);
  };

  // Helper to check if a key is active (not expired and not revoked)
  const isKeyActive = (key: ApiKey): boolean => {
    const now = new Date().toISOString();
    const notExpired = !key.expiresAt || key.expiresAt > now;
    const notRevoked = !key.revokedAt;
    return notExpired && notRevoked;
  };

  return {
    apiKeys,
    isLoading,
    keyTypeFilter,
    activeFilter,
    createApiKey,
    revokeApiKey,
    rotateApiKey,
    fetchApiKeys,
    handleKeyTypeFilterChange,
    handleActiveFilterChange,
    clearFilters,
    isKeyActive,
  };
};

export default useApiKeys;
