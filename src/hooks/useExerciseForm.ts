// src/hooks/useExerciseForm.ts
import { useState } from 'react';
import { useToast } from './useToast';
import { useNavigate } from 'react-router-dom';
import type { ExerciseFormData } from '../types/exerciseFormTypes';
import { defaultExerciseFormData } from '../types/exerciseFormTypes';
import exerciseService from '../api/exerciseService';
import type { Exercise, MediaMetadata } from '../api/exerciseService';
import { parseInstructions } from '../utils/instructionsParser';

// Define the valid enum types
type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type Mechanics = 'compound' | 'isolation';
type Force = 'push' | 'pull' | 'static';
type Status = 'draft' | 'published' | 'archived';
type PlaneOfMotion = 'sagittal' | 'frontal' | 'transverse';
type MovementPattern = 'squat' | 'hinge' | 'lunge' | 'push' | 'pull' | 'carry';
type RiskLevel = 'low' | 'medium' | 'high';

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
      // Parse instructions to ensure form_points is properly set
      const parsedFormPoints = parseInstructions(data.instructions || '');

      // Map the status to the correct type if it exists
      const mappedStatus = data.status?.toLowerCase() as Status | undefined;
      if (
        mappedStatus &&
        !['draft', 'published', 'archived'].includes(mappedStatus)
      ) {
        throw new Error('Invalid status value');
      }

      // Process common mistakes to ensure risk_level is properly typed
      const processedMistakes = data.common_mistakes?.mistakes?.map(
        (mistake) => ({
          ...mistake,
          risk_level: mistake.risk_level.toLowerCase() as RiskLevel,
        })
      );

      // Prepare form data with form_points properly set
      const processedData = {
        ...data,
        difficulty: data.difficulty as Difficulty,
        mechanics: data.mechanics?.toLowerCase() as Mechanics,
        force: data.force?.toLowerCase() as Force,
        status: mappedStatus || 'draft', // Default to 'draft' if no status is provided
        plane_of_motion: data.plane_of_motion?.toLowerCase() as PlaneOfMotion,
        movement_pattern:
          data.movement_pattern?.toLowerCase() as MovementPattern,
        form_points: {
          setup: parsedFormPoints.setup || [],
          execution: parsedFormPoints.execution || [],
          breathing: parsedFormPoints.breathing || [],
          alignment: parsedFormPoints.alignment || [],
        },
        common_mistakes: processedMistakes
          ? { mistakes: processedMistakes }
          : undefined,
      } as Partial<Exercise>;

      // If we have media files, use the createExerciseWithMedia endpoint
      if (!exerciseId && mediaFiles && mediaFiles.length > 0) {
        // Create metadata array for each file
        const mediaMetadata: MediaMetadata[] = mediaFiles.map(
          (file, index) => ({
            type: file.type.startsWith('video/') ? 'video' : 'image',
            viewAngle: 'front', // default if not specified
            isPrimary: index === 0, // First file is primary by default
            format: file.name.split('.').pop()?.toLowerCase() || 'jpg',
            title: file.name,
            size: file.size,
            duration: file.type.startsWith('video/') ? 0 : undefined, // You might want to calculate actual video duration
          })
        );

        const newExercise = await exerciseService.createExerciseWithMedia(
          processedData,
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
        await exerciseService.updateExercise(exerciseId, processedData);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Exercise updated successfully',
        });
        navigate(`/exercises/${exerciseId}`);
      } else {
        // Create new exercise without media
        const newExercise = await exerciseService.createExercise(processedData);
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
