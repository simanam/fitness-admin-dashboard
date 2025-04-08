// src/hooks/useMovementPatternForm.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './useToast';
import movementPatternService from '../api/movementPatternService';

interface MovementPatternFormData {
  name: string;
  patternType: string;
  category: string;
  description: string;
}

interface UseMovementPatternFormProps {
  patternId?: string;
  initialData?: MovementPatternFormData;
}

export const useMovementPatternForm = ({
  patternId,
  initialData,
}: UseMovementPatternFormProps = {}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  // Default form data
  const defaultFormData: MovementPatternFormData = {
    name: '',
    patternType: 'push',
    category: 'upper_body',
    description: '',
  };

  // Initialize form with provided data or defaults
  const [formData, setFormData] = useState<MovementPatternFormData>(
    initialData || defaultFormData
  );

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormTouched(true);
  };

  // Validate the form
  const validateForm = () => {
    const errors: Partial<Record<keyof MovementPatternFormData, string>> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.patternType) {
      errors.patternType = 'Pattern type is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  // Handle form submission - create or update
  const handleSubmit = async (customData?: MovementPatternFormData) => {
    const dataToSubmit = customData || formData;
    const { isValid, errors } = validateForm();

    if (!isValid) {
      // Show errors in toast
      const errorMessage = Object.values(errors).join(', ');
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: errorMessage,
      });
      return false;
    }

    setIsSubmitting(true);
    try {
      if (patternId) {
        // Update existing pattern
        await movementPatternService.updateMovementPattern(
          patternId,
          dataToSubmit
        );
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Movement pattern updated successfully',
        });
        navigate(`/movement-patterns/${patternId}`);
      } else {
        // Create new pattern
        const newPattern =
          await movementPatternService.createMovementPattern(dataToSubmit);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Movement pattern created successfully',
        });
        navigate(`/movement-patterns/${newPattern.id}`);
      }
      return true;
    } catch (error) {
      console.error(
        `Error ${patternId ? 'updating' : 'creating'} movement pattern:`,
        error
      );
      showToast({
        type: 'error',
        title: 'Error',
        message: `Failed to ${
          patternId ? 'update' : 'create'
        } movement pattern`,
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button - navigate back
  const handleCancel = () => {
    if (patternId) {
      navigate(`/movement-patterns/${patternId}`);
    } else {
      navigate('/movement-patterns');
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    handleCancel,
    isSubmitting,
    formTouched,
    validateForm,
  };
};

export default useMovementPatternForm;
