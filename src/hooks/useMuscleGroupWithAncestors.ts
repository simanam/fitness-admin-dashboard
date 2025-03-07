// src/hooks/useMuscleGroupWithAncestors.ts
import { useState, useEffect } from 'react';
import { useToast } from './useToast';
import muscleGroupService from '../api/muscleGroupService';
import { MuscleGroup } from '../api/muscleService';

export const useMuscleGroupWithAncestors = (groupId: string | null) => {
  const [group, setGroup] = useState<MuscleGroup | null>(null);
  const [ancestors, setAncestors] = useState<MuscleGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!groupId) {
      setGroup(null);
      setAncestors([]);
      return;
    }

    const fetchGroupWithAncestors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const groupData = await muscleGroupService.getMuscleGroup(groupId);
        setGroup(groupData);

        // Fetch ancestors if needed
        if (groupData.parentGroupId) {
          const fetchAncestors = async (
            currentGroupId: string,
            currentAncestors: MuscleGroup[] = []
          ): Promise<MuscleGroup[]> => {
            const parentGroup =
              await muscleGroupService.getMuscleGroup(currentGroupId);
            const updatedAncestors = [parentGroup, ...currentAncestors];

            if (parentGroup.parentGroupId) {
              return fetchAncestors(
                parentGroup.parentGroupId,
                updatedAncestors
              );
            }

            return updatedAncestors;
          };

          const ancestorGroups = await fetchAncestors(groupData.parentGroupId);
          setAncestors(ancestorGroups);
        } else {
          setAncestors([]);
        }
      } catch (err) {
        console.error('Error fetching muscle group with ancestors:', err);
        setError('Failed to load muscle group details');
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load muscle group details',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupWithAncestors();
  }, [groupId, showToast]);

  return {
    group,
    ancestors,
    isLoading,
    error,
  };
};

export default useMuscleGroupWithAncestors;
