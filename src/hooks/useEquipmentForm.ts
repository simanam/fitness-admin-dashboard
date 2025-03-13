// src/hooks/useEquipmentForm.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './useToast';
import {
  EquipmentFormData,
  defaultEquipmentFormData,
} from '../types/equipmentFormTypes';
import equipmentService from '../api/equipmentService';

interface UseEquipmentFormProps {
  equipmentId?: string;
  initialData?: EquipmentFormData;
}

export const useEquipmentForm = ({
  equipmentId,
  initialData,
}: UseEquipmentFormProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EquipmentFormData>(
    initialData || defaultEquipmentFormData
  );
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (data: EquipmentFormData) => {
    setIsSubmitting(true);
    try {
      if (equipmentId) {
        // Update existing equipment
        await equipmentService.updateEquipment(equipmentId, data);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Equipment updated successfully',
        });
        navigate(`/equipment/${equipmentId}`);
      } else {
        // Create new equipment
        const newEquipment = await equipmentService.createEquipment(data);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Equipment created successfully',
        });
        navigate(`/equipment/${newEquipment.id}`);
      }
    } catch (error) {
      console.error('Error submitting equipment:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: equipmentId
          ? 'Failed to update equipment'
          : 'Failed to create equipment',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (equipmentId) {
      navigate(`/equipment/${equipmentId}`);
    } else {
      navigate('/equipment');
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

export default useEquipmentForm;
