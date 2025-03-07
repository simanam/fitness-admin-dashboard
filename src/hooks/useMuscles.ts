// src/hooks/useMuscles.ts
import { useState, useEffect } from 'react';
import { useToast } from './useToast';
import muscleService, { Muscle } from '../api/muscleService';

interface UseMusclesParams {
  initialMuscleGroupId?: string;
}

export const useMuscles = ({ initialMuscleGroupId }: UseMusclesParams = {}) => {
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroupId, setSelectedMuscleGroupId] = useState<
    string | undefined
  >(initialMuscleGroupId);
  const { showToast } = useToast();

  // Fetch muscles when dependencies change
  useEffect(() => {
    fetchMuscles();
  }, [currentPage, searchQuery, selectedMuscleGroupId]);

  const fetchMuscles = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchQuery,
        muscleGroupId: selectedMuscleGroupId,
      };

      const response = await muscleService.getMusclesWithPagination(params);
      setMuscles(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (error) {
      console.error('Error fetching muscles:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch muscles. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleMuscleGroupChange = (groupId: string | undefined) => {
    setSelectedMuscleGroupId(groupId);
    setCurrentPage(1);
  };

  const deleteMuscle = async (id: string) => {
    try {
      await muscleService.deleteMuscle(id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Muscle deleted successfully',
      });

      if (muscles.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchMuscles();
      }
      return true;
    } catch (error) {
      console.error('Error deleting muscle:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete muscle',
      });
      return false;
    }
  };

  const bulkDeleteMuscles = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => muscleService.deleteMuscle(id)));
      showToast({
        type: 'success',
        title: 'Success',
        message: `${ids.length} muscles deleted successfully`,
      });

      setSelectedIds([]);
      fetchMuscles();
      return true;
    } catch (error) {
      console.error('Error bulk deleting muscles:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete muscles',
      });
      return false;
    }
  };

  return {
    muscles,
    isLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    selectedMuscleGroupId,
    handlePageChange,
    handleSearchChange,
    handleMuscleGroupChange,
    deleteMuscle,
    bulkDeleteMuscles,
    fetchMuscles,
  };
};

export default useMuscles;
