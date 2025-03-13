// src/hooks/useAdminUsers.ts
import { useState, useEffect } from 'react';
import { useToast } from './useToast';
import adminUserService, {
  AdminUser,
  AdminUserFilterParams,
} from '../api/adminUserService';

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortKey, setSortKey] = useState<string>('email');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const { showToast } = useToast();

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, sortKey, sortOrder, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params: AdminUserFilterParams = {
        page: currentPage,
        per_page: itemsPerPage,
        sort: sortKey,
        order: sortOrder,
        search: searchQuery,
        role: roleFilter,
      };

      const response = await adminUserService.getAdminUsers(params);
      setUsers(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch admin users. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const clearFilters = () => {
    setRoleFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const deleteUser = async (id: string) => {
    try {
      await adminUserService.deleteAdminUser(id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Admin user deleted successfully',
      });

      // If we deleted the last item on a page, go to previous page (unless we're on the first page)
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchUsers(); // Refresh the list
      }
      return true;
    } catch (error) {
      console.error('Error deleting admin user:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete admin user. Please try again.',
      });
      return false;
    }
  };

  return {
    users,
    isLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    totalPages,
    totalItems,
    sortKey,
    sortOrder,
    searchQuery,
    roleFilter,
    handlePageChange,
    handleSortChange,
    handleSearchChange,
    handleRoleFilterChange,
    clearFilters,
    deleteUser,
    fetchUsers,
  };
};

export default useAdminUsers;
