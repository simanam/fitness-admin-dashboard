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

  // Handle form submission - supports both standard submit and media uploads
  const handleSubmit = async (data: ExerciseFormData, mediaFiles?: File[]) => {
    setIsSubmitting(true);
    try {
      // Ensure form_points exists with all required arrays
      const formData = {
        ...data,
        form_points: {
          setup: data.form_points?.setup || [],
          execution: data.form_points?.execution || [],
          breathing: data.form_points?.breathing || [],
          alignment: data.form_points?.alignment || [],
        },
      };

      // If we have media files, use the createExerciseWithMedia endpoint
      if (!exerciseId && mediaFiles && mediaFiles.length > 0) {
        // Create metadata array for each file
        const mediaMetadata = mediaFiles.map((file, index) => ({
          // Use file properties or defaults
          mediaType: file.type.startsWith('video/') ? 'video' : 'image',
          viewAngle: 'front', // default if not specified
          isPrimary: index === 0, // First file is primary by default
          format: file.name.split('.').pop()?.toLowerCase(),
          // Add other metadata as needed
        }));

        const newExercise = await exerciseService.createExerciseWithMedia(
          formData,
          mediaFiles,
          mediaMetadata
        );

        showToast({
          type: 'success',
          title: 'Success',
          message: 'Exercise created successfully with media',
        });

        navigate(`/exercises/${newExercise.id}`);
      } else if (exerciseId) {
        // Update existing exercise
        await exerciseService.updateExercise(exerciseId, formData);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Exercise updated successfully',
        });
        navigate(`/exercises/${exerciseId}`);
      } else {
        // Create new exercise without media
        const newExercise = await exerciseService.createExercise(formData);
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
