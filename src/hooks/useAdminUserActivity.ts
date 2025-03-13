// src/hooks/useAdminUserActivity.ts
import { useState, useEffect } from 'react';
import { useToast } from './useToast';
import adminUserService, { AdminUserActivity } from '../api/adminUserService';

export const useAdminUserActivity = (userId: string, limit: number = 10) => {
  const [activities, setActivities] = useState<AdminUserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchActivities();
  }, [userId, limit]);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminUserService.getAdminUserActivity(userId, limit);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching user activity:', err);
      setError('Failed to load user activity');
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load user activity',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivities,
  };
};

export default useAdminUserActivity;
