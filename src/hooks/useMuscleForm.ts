// src/hooks/useMuscleForm.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './useToast';
import {
  MuscleFormData,
  defaultMuscleFormData,
} from '../types/muscleFormTypes';
import muscleService from '../api/muscleService';

interface UseMuscleFormProps {
  muscleId?: string;
  initialData?: MuscleFormData;
}

export const useMuscleForm = ({
  muscleId,
  initialData,
}: UseMuscleFormProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MuscleFormData>(
    initialData || defaultMuscleFormData
  );
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (data: MuscleFormData) => {
    setIsSubmitting(true);
    try {
      // Create FormData for multipart submission if there's an SVG file
      const formData = new FormData();

      // Add basic fields
      formData.append('name', data.name);
      if (data.commonName) formData.append('commonName', data.commonName);
      if (data.description) formData.append('description', data.description);
      formData.append('muscleGroupId', data.muscleGroupId);

      // Handle SVG file
      if (data.svgFile) {
        formData.append('svgFile', data.svgFile);
      } else if (muscleId && data.keepExistingSvg) {
        // If editing and keeping existing SVG, tell the server not to change it
        formData.append('keepExistingSvg', 'true');
      }

      if (muscleId) {
        // Update existing muscle

        await muscleService.updateMuscleWithSvg(muscleId, formData);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Muscle updated successfully',
        });
        navigate(`/muscles/${muscleId}`);
      } else {
        // Create new muscle
        const newMuscle = await muscleService.createMuscleWithSvg(formData);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Muscle created successfully',
        });
        navigate(`/muscles/${newMuscle.id}`);
      }
    } catch (error) {
      console.error('Error submitting muscle:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: muscleId
          ? 'Failed to update muscle'
          : 'Failed to create muscle',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (muscleId) {
      navigate(`/muscles/${muscleId}`);
    } else {
      navigate('/muscles');
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

export default useMuscleForm;
