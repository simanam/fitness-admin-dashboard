// src/hooks/useMuscleGroupHierarchy.ts
import { useState, useEffect } from 'react';
import { useToast } from './useToast';
import muscleGroupService, {
  MuscleGroupHierarchyItem,
} from '../api/muscleGroupService';
import { MuscleGroup } from '../api/muscleService';

export const useMuscleGroupHierarchy = () => {
  const [hierarchy, setHierarchy] = useState<MuscleGroupHierarchyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchHierarchy = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await muscleGroupService.getMuscleGroupHierarchy();
      setHierarchy(data);
    } catch (err) {
      console.error('Error fetching muscle group hierarchy:', err);
      setError('Failed to load muscle group hierarchy');
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load muscle group hierarchy',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const createMuscleGroup = async (groupData: Partial<MuscleGroup>) => {
    try {
      const newGroup = await muscleGroupService.createMuscleGroup(groupData);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Muscle group created successfully',
      });
      await fetchHierarchy();
      return newGroup;
    } catch (err) {
      console.error('Error creating muscle group:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create muscle group',
      });
      throw err;
    }
  };

  const updateMuscleGroup = async (
    id: string,
    groupData: Partial<MuscleGroup>
  ) => {
    try {
      const updatedGroup = await muscleGroupService.updateMuscleGroup(
        id,
        groupData
      );
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Muscle group updated successfully',
      });
      await fetchHierarchy();
      return updatedGroup;
    } catch (err) {
      console.error('Error updating muscle group:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update muscle group',
      });
      throw err;
    }
  };

  const deleteMuscleGroup = async (id: string) => {
    try {
      await muscleGroupService.deleteMuscleGroup(id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Muscle group deleted successfully',
      });
      await fetchHierarchy();
      return true;
    } catch (err) {
      console.error('Error deleting muscle group:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete muscle group',
      });
      return false;
    }
  };

  const moveMuscleGroup = async (id: string, newParentId: string | null) => {
    try {
      await muscleGroupService.moveMuscleGroup(id, newParentId);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Muscle group moved successfully',
      });
      await fetchHierarchy();
      return true;
    } catch (err) {
      console.error('Error moving muscle group:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to move muscle group',
      });
      return false;
    }
  };

  const reorderMuscleGroups = async (
    reorderData: { id: string; order: number }[]
  ) => {
    try {
      await muscleGroupService.reorderMuscleGroups(reorderData);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Muscle groups reordered successfully',
      });
      await fetchHierarchy();
      return true;
    } catch (err) {
      console.error('Error reordering muscle groups:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to reorder muscle groups',
      });
      return false;
    }
  };

  return {
    hierarchy,
    isLoading,
    error,
    fetchHierarchy,
    createMuscleGroup,
    updateMuscleGroup,
    deleteMuscleGroup,
    moveMuscleGroup,
    reorderMuscleGroups,
  };
};

export default useMuscleGroupHierarchy;
