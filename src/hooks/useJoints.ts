// src/hooks/useJoints.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast';
import jointService from '../api/jointService';
import type { Joint, JointFilterParams } from '../api/jointService';

export const useJoints = () => {
  const [joints, setJoints] = useState<Joint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const { showToast } = useToast();

  const fetchJoints = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: JointFilterParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        type: typeFilter,
        sort: sortKey,
        order: sortOrder,
      };

      const response = await jointService.getJoints(params);
      setJoints(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (error) {
      console.error('Error fetching joints:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch joints. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, typeFilter, sortKey, sortOrder, showToast]);

  // Fetch joints when dependencies change
  useEffect(() => {
    void fetchJoints();
  }, [fetchJoints]);

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

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const clearFilters = () => {
    setTypeFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const deleteJoint = async (id: string) => {
    try {
      await jointService.deleteJoint(id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Joint deleted successfully',
      });

      // If we deleted the last item on a page, go to previous page (unless we're on the first page)
      if (joints.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        void fetchJoints(); // Refresh the list
      }
      return true;
    } catch (error) {
      console.error('Error deleting joint:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete joint. Please try again.',
      });
      return false;
    }
  };

  // Get all available joint types for filtering
  const getAvailableTypes = (): { value: string; label: string }[] => {
    return [
      { value: 'ball_and_socket', label: 'Ball and Socket' },
      { value: 'hinge', label: 'Hinge' },
      { value: 'pivot', label: 'Pivot' },
      { value: 'ellipsoidal', label: 'Ellipsoidal' },
      { value: 'saddle', label: 'Saddle' },
      { value: 'gliding', label: 'Gliding' },
      { value: 'other', label: 'Other' },
    ];
  };

  return {
    joints,
    isLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    totalPages,
    totalItems,
    sortKey,
    sortOrder,
    searchQuery,
    typeFilter,
    handlePageChange,
    handleSortChange,
    handleSearchChange,
    handleTypeFilterChange,
    clearFilters,
    deleteJoint,
    fetchJoints,
    getAvailableTypes,
  };
};

export default useJoints;
