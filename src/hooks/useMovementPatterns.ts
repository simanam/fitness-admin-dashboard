// src/hooks/useMovementPatterns.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast';
import movementPatternService from '../api/movementPatternService';
import type {
  MovementPattern,
  MovementPatternFilterParams,
} from '../api/movementPatternService';

interface MovementPatternResponse {
  items: MovementPattern[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseMovementPatternsParams {
  initialCategoryFilter?: string;
  initialTypeFilter?: string;
}

export const useMovementPatterns = ({
  initialCategoryFilter,
  initialTypeFilter,
}: UseMovementPatternsParams = {}) => {
  const [patterns, setPatterns] = useState<MovementPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(
    initialCategoryFilter || ''
  );
  const [typeFilter, setTypeFilter] = useState<string>(initialTypeFilter || '');
  const { showToast } = useToast();

  const fetchPatterns = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: MovementPatternFilterParams = {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortKey,
        order: sortOrder,
        search: searchQuery,
        category: categoryFilter,
        patternType: typeFilter,
      };

      const response = await movementPatternService.getMovementPatterns(params);
      setPatterns(response.items || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalItems(response.meta?.total || 0);
    } catch (error) {
      console.error('Error fetching movement patterns:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch movement patterns. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    sortKey,
    sortOrder,
    searchQuery,
    categoryFilter,
    typeFilter,
    showToast,
  ]);

  // Fetch patterns when dependencies change
  useEffect(() => {
    void fetchPatterns();
  }, [fetchPatterns]);

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

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setTypeFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const deleteMovementPattern = async (id: string) => {
    try {
      await movementPatternService.deleteMovementPattern(id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Movement pattern deleted successfully',
      });

      // If we deleted the last item on a page, go to previous page (unless we're on the first page)
      if (patterns.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchPatterns(); // Refresh the list
      }
      return true;
    } catch (error) {
      console.error('Error deleting movement pattern:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete movement pattern. Please try again.',
      });
      return false;
    }
  };

  const bulkDeleteMovementPatterns = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) => movementPatternService.deleteMovementPattern(id))
      );
      showToast({
        type: 'success',
        title: 'Success',
        message: `${ids.length} movement patterns deleted successfully`,
      });
      setSelectedIds([]);
      fetchPatterns();
      return true;
    } catch (error) {
      console.error('Error bulk deleting movement patterns:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete movement patterns. Please try again.',
      });
      return false;
    }
  };

  // Get all available categories for filtering
  const getAvailableCategories = async (): Promise<
    { value: string; label: string }[]
  > => {
    try {
      const distribution =
        await movementPatternService.getCategoryDistribution();

      // Format the categories from the distribution data
      const categories = Object.keys(distribution).map((category) => ({
        value: category,
        label: formatCategoryName(category),
        count: distribution[category],
      }));

      // Sort by count descending
      return categories.sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [
        { value: 'lower_body', label: 'Lower Body' },
        { value: 'upper_body', label: 'Upper Body' },
        { value: 'core', label: 'Core' },
        { value: 'full_body', label: 'Full Body' },
      ];
    }
  };

  // Get all available types for filtering
  const getAvailableTypes = async (): Promise<
    { value: string; label: string }[]
  > => {
    try {
      const distribution = await movementPatternService.getTypeDistribution();

      // Format the types from the distribution data
      const types = Object.keys(distribution).map((type) => ({
        value: type,
        label: formatTypeName(type),
        count: distribution[type],
      }));

      // Sort by count descending
      return types.sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error fetching types:', error);
      return [
        { value: 'push', label: 'Push' },
        { value: 'pull', label: 'Pull' },
        { value: 'squat', label: 'Squat' },
        { value: 'hinge', label: 'Hinge' },
        { value: 'lunge', label: 'Lunge' },
        { value: 'carry', label: 'Carry' },
        { value: 'rotation', label: 'Rotation' },
      ];
    }
  };

  // Helper function to format category names for display
  const formatCategoryName = (category: string): string => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Helper function to format type names for display
  const formatTypeName = (type: string): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return {
    patterns,
    isLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    totalPages,
    totalItems,
    sortKey,
    sortOrder,
    searchQuery,
    categoryFilter,
    typeFilter,
    handlePageChange,
    handleSortChange,
    handleSearchChange,
    handleCategoryFilterChange,
    handleTypeFilterChange,
    clearFilters,
    deleteMovementPattern,
    bulkDeleteMovementPatterns,
    fetchPatterns,
    getAvailableCategories,
    getAvailableTypes,
    formatCategoryName,
    formatTypeName,
  };
};

export default useMovementPatterns;
