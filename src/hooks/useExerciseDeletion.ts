// src/hooks/useExerciseDeletion.ts
import { useState } from 'react';
import { useToast } from './useToast';
import exerciseService from '../api/exerciseService';

interface UseExerciseDeletionProps {
  onSuccess?: () => void;
}

export const useExerciseDeletion = ({
  onSuccess,
}: UseExerciseDeletionProps = {}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const deleteExercise = async (exerciseId: string) => {
    setIsDeleting(true);
    try {
      await exerciseService.deleteExercise(exerciseId);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Exercise deleted successfully',
      });
      onSuccess?.();
      return true;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete exercise',
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    deleteExercise,
  };
};

export default useExerciseDeletion;
