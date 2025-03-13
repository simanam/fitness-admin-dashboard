// src/hooks/useEquipmentDeletion.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './useToast';
import equipmentService from '../api/equipmentService';

interface UseEquipmentDeletionProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const useEquipmentDeletion = ({
  onSuccess,
  redirectTo = '/equipment',
}: UseEquipmentDeletionProps = {}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const confirmDelete = (id: string, name: string) => {
    setEquipmentToDelete({ id, name });
    setShowDeleteDialog(true);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setEquipmentToDelete(null);
  };

  const deleteEquipment = async () => {
    if (!equipmentToDelete) return;

    setIsDeleting(true);
    try {
      await equipmentService.deleteEquipment(equipmentToDelete.id);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Equipment deleted successfully',
      });

      if (onSuccess) {
        onSuccess();
      } else if (redirectTo) {
        navigate(redirectTo);
      }

      setShowDeleteDialog(false);
      setEquipmentToDelete(null);

      return true;
    } catch (error) {
      console.error('Error deleting equipment:', error);

      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete equipment',
      });

      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    showDeleteDialog,
    equipmentToDelete,
    confirmDelete,
    cancelDelete,
    deleteEquipment,
  };
};

export default useEquipmentDeletion;
