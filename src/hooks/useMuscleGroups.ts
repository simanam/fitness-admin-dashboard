// src/hooks/useMuscleGroups.ts
import { useState, useEffect } from 'react';
import { useToast } from './useToast';
import muscleService, { MuscleGroup } from '../api/muscleService';

export const useMuscleGroups = () => {
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchMuscleGroups();
  }, []);

  const fetchMuscleGroups = async () => {
    setIsLoading(true);
    try {
      const groups = await muscleService.getMuscleGroups();
      setMuscleGroups(groups);
    } catch (error) {
      console.error('Error fetching muscle groups:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch muscle groups',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    muscleGroups,
    isLoading,
    fetchMuscleGroups,
  };
};

export default useMuscleGroups;
