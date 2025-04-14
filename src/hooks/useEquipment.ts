// src/hooks/useEquipment.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast';
import equipmentService from '../api/equipmentService';
import type { Equipment, EquipmentFilterParams } from '../api/equipmentService';

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isCommonFilter, setIsCommonFilter] = useState<boolean | undefined>(
    undefined
  );
  const { showToast } = useToast();

  // Memoize fetchEquipment to prevent unnecessary recreations
  const fetchEquipment = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: EquipmentFilterParams = {
        page: currentPage,
        per_page: itemsPerPage,
        sort: sortKey,
        order: sortOrder,
        search: searchQuery,
        category: categoryFilter,
        isCommon: isCommonFilter,
      };

      const response = await equipmentService.getEquipment(params);

      setEquipment(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch equipment. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortKey,
    sortOrder,
    searchQuery,
    categoryFilter,
    isCommonFilter,
    showToast,
  ]);

  // Fetch equipment when dependencies change
  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

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

  const handleCategoryFilterChange = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const handleIsCommonFilterChange = (isCommon: boolean) => {
    setIsCommonFilter(isCommon);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setIsCommonFilter(undefined);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const deleteEquipment = async (id: string) => {
    try {
      await equipmentService.deleteEquipment(id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Equipment deleted successfully',
      });

      // If we deleted the last item on a page, go to previous page (unless we're on the first page)
      if (equipment.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchEquipment(); // Refresh the list
      }
      return true;
    } catch (error) {
      console.error('Error deleting equipment:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete equipment. Please try again.',
      });
      return false;
    }
  };

  // Get all available categories for filtering
  const getAvailableCategories = (): { value: string; label: string }[] => {
    const categories = [
      { value: 'free_weights', label: 'Free Weights' },
      { value: 'machines', label: 'Machines' },
      { value: 'cables', label: 'Cables' },
      { value: 'bodyweight', label: 'Bodyweight' },
      { value: 'cardio', label: 'Cardio' },
      { value: 'accessories', label: 'Accessories' },
    ];

    return categories;
  };

  return {
    equipment,
    isLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    sortKey,
    sortOrder,
    searchQuery,
    categoryFilter,
    isCommonFilter,
    handlePageChange,
    handleSortChange,
    handleSearchChange,
    handleCategoryFilterChange,
    handleIsCommonFilterChange,
    clearFilters,
    deleteEquipment,
    fetchEquipment,
    getAvailableCategories,
  };
};

export default useEquipment;
