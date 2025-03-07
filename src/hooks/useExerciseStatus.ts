// src/hooks/useExerciseStatus.ts
import { useState } from 'react';
import { useToast } from './useToast';
import exerciseService from '../api/exerciseService';

interface UseExerciseStatusProps {
  onSuccess?: () => void;
}

export const useExerciseStatus = ({
  onSuccess,
}: UseExerciseStatusProps = {}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useToast();

  const updateStatus = async (exerciseId: string, status: string) => {
    setIsUpdating(true);
    try {
      await exerciseService.updateExerciseStatus(exerciseId, status);
      showToast({
        type: 'success',
        title: 'Success',
        message: `Exercise ${status.toLowerCase()} successfully`,
      });
      onSuccess?.();
      return true;
    } catch (error) {
      console.error('Error updating exercise status:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: `Failed to update exercise status`,
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const bulkUpdateStatus = async (ids: string[], status: string) => {
    setIsUpdating(true);
    try {
      await exerciseService.bulkUpdateStatus(ids, status);
      showToast({
        type: 'success',
        title: 'Success',
        message: `${ids.length} exercises ${status.toLowerCase()} successfully`,
      });
      onSuccess?.();
      return true;
    } catch (error) {
      console.error('Error bulk updating exercise status:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: `Failed to update exercise status`,
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    updateStatus,
    bulkUpdateStatus,
  };
};

export default useExerciseStatus;
