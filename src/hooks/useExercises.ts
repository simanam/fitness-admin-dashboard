// src/hooks/useExercises.ts
import { useState, useEffect } from 'react';
import { useToast } from './useToast';
import exerciseService from '../api/exerciseService';
import type { Exercise, ExerciseFilterParams } from '../api/exerciseService';

// Define valid filter value types
type FilterValue = string | number | boolean | string[] | null;

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20; // Convert to constant since setter is unused
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<
    Omit<
      ExerciseFilterParams,
      'page' | 'per_page' | 'sort' | 'order' | 'search'
    >
  >({});
  const { showToast } = useToast();

  // Memoize fetchExercises dependencies
  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const params: ExerciseFilterParams = {
        page: currentPage,
        per_page: itemsPerPage,
        sort: sortKey,
        order: sortOrder,
        search: searchQuery,
        ...filters,
      };

      const response = await exerciseService.getExercises(params);
      setExercises(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch exercises. Please try again.',
      });
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch exercises when dependencies change
  useEffect(() => {
    void fetchExercises();
  }, [currentPage, sortKey, sortOrder, searchQuery, JSON.stringify(filters)]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleFilterChange = (key: string, value: FilterValue) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page on new filter
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const deleteExercise = async (id: string) => {
    try {
      await exerciseService.deleteExercise(id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Exercise deleted successfully',
      });

      // If we deleted the last item on a page, go to previous page (unless we're on the first page)
      if (exercises.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchExercises(); // Refresh the list
      }
      return true;
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete exercise. Please try again.',
      });
      console.error('Error deleting exercise:', error);
      return false;
    }
  };

  const bulkArchiveExercises = async (ids: string[]) => {
    try {
      await exerciseService.bulkUpdateStatus(ids, 'archived');
      showToast({
        type: 'success',
        title: 'Success',
        message: `${ids.length} exercises archived successfully`,
      });

      setSelectedIds([]);
      fetchExercises(); // Refresh the list
      return true;
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to archive exercises. Please try again.',
      });
      console.error('Error bulk archiving exercises:', error);
      return false;
    }
  };

  const publishExercise = async (id: string) => {
    try {
      await exerciseService.updateExerciseStatus(id, 'published');
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Exercise published successfully',
      });

      // Update in state
      setExercises((currentExercises) =>
        currentExercises.map((e) =>
          e.id === id ? { ...e, status: 'published' as const } : e
        )
      );
      return true;
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to publish exercise. Please try again.',
      });
      console.error('Error publishing exercise:', error);
      return false;
    }
  };

  return {
    exercises,
    isLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    totalPages,
    totalItems,
    sortKey,
    sortOrder,
    searchQuery,
    filters,
    handlePageChange,
    handleSortChange,
    handleSearchChange,
    handleFilterChange,
    clearFilters,
    deleteExercise,
    bulkArchiveExercises,
    publishExercise,
    fetchExercises,
  };
};

export default useExercises;
