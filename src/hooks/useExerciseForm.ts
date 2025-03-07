// src/hooks/useExerciseForm.ts
import { useState } from 'react';
import { useToast } from './useToast';
import { useNavigate } from 'react-router-dom';
import {
  ExerciseFormData,
  defaultExerciseFormData,
} from '../types/exerciseFormTypes';
import exerciseService from '../api/exerciseService';

interface UseExerciseFormProps {
  exerciseId?: string;
  initialData?: ExerciseFormData;
}

export const useExerciseForm = ({
  exerciseId,
  initialData,
}: UseExerciseFormProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExerciseFormData>(
    initialData || defaultExerciseFormData
  );
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (data: ExerciseFormData) => {
    setIsSubmitting(true);
    try {
      if (exerciseId) {
        // Update existing exercise
        await exerciseService.updateExercise(exerciseId, data);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Exercise updated successfully',
        });
        navigate(`/exercises/${exerciseId}`);
      } else {
        // Create new exercise
        const newExercise = await exerciseService.createExercise(data);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Exercise created successfully',
        });
        navigate(`/exercises/${newExercise.id}`);
      }
    } catch (error) {
      console.error('Error submitting exercise:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: exerciseId
          ? 'Failed to update exercise'
          : 'Failed to create exercise',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (exerciseId) {
      navigate(`/exercises/${exerciseId}`);
    } else {
      navigate('/exercises');
    }
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit,
    handleCancel,
  };
};

export default useExerciseForm;
