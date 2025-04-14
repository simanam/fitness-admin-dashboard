// src/hooks/useClients.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast';
import clientService from '../api/clientService';
import type { Client, ClientFilterParams } from '../api/clientService';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const { showToast } = useToast();

  // Memoize fetchClients to prevent unnecessary recreations
  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ClientFilterParams = {
        page: currentPage,
        per_page: itemsPerPage,
        sort: sortKey,
        order: sortOrder,
        search: searchQuery,
        status: statusFilter,
        tier: tierFilter,
        startDate: dateRangeFilter.startDate,
        endDate: dateRangeFilter.endDate,
      };

      const response = await clientService.getClients(params);
      setClients(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (error) {
      console.error('Error fetching clients:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch clients. Please try again.',
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
    statusFilter,
    tierFilter,
    dateRangeFilter,
    showToast,
  ]);

  // Fetch clients when dependencies change
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const handleTierFilterChange = (tier: string) => {
    setTierFilter(tier);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const handleDateRangeFilterChange = (
    startDate?: string,
    endDate?: string
  ) => {
    setDateRangeFilter({ startDate, endDate });
    setCurrentPage(1); // Reset to first page on new filter
  };

  const clearFilters = () => {
    setStatusFilter('');
    setTierFilter('');
    setDateRangeFilter({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const updateClientStatus = async (
    id: string,
    status: string,
    reason?: string
  ) => {
    try {
      await clientService.updateClientStatus(id, status, reason);
      showToast({
        type: 'success',
        title: 'Success',
        message: `Client ${status === 'suspended' ? 'suspended' : status} successfully`,
      });
      fetchClients(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error updating client status:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update client status. Please try again.',
      });
      return false;
    }
  };

  const updateClientTier = async (id: string, tier: string) => {
    try {
      await clientService.updateClientTier(id, tier);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Client tier updated successfully',
      });
      fetchClients(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error updating client tier:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update client tier. Please try again.',
      });
      return false;
    }
  };

  const suspendClient = async (id: string, reason: string) => {
    try {
      await clientService.suspendClient(id, reason);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Client suspended successfully',
      });
      fetchClients(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error suspending client:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to suspend client. Please try again.',
      });
      return false;
    }
  };

  const reactivateClient = async (id: string) => {
    try {
      await clientService.reactivateClient(id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Client reactivated successfully',
      });
      fetchClients(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error reactivating client:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to reactivate client. Please try again.',
      });
      return false;
    }
  };

  // Get all available tiers for filtering
  const getAvailableTiers = (): { value: string; label: string }[] => {
    return [
      { value: 'free', label: 'Free' },
      { value: 'basic', label: 'Basic' },
      { value: 'premium', label: 'Premium' },
      { value: 'enterprise', label: 'Enterprise' },
    ];
  };

  // Get all available statuses for filtering
  const getAvailableStatuses = (): { value: string; label: string }[] => {
    return [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'suspended', label: 'Suspended' },
    ];
  };

  return {
    clients,
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
    statusFilter,
    tierFilter,
    dateRangeFilter,
    handlePageChange,
    handleSortChange,
    handleSearchChange,
    handleStatusFilterChange,
    handleTierFilterChange,
    handleDateRangeFilterChange,
    clearFilters,
    updateClientStatus,
    updateClientTier,
    suspendClient,
    reactivateClient,
    fetchClients,
    getAvailableTiers,
    getAvailableStatuses,
  };
};

export default useClients;
