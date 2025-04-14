// src/pages/clients/ClientList.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit,
  Plus,
  Search,
  X,
  Filter,
  Database,
  MoreHorizontal,
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import type { Column } from '../../components/common/DataTable';
import Pagination from '../../components/ui/pagination';
import EmptyState from '../../components/ui/empty-state';
import StatusBadge from '../../components/clients/StatusBadge';
import TierBadge from '../../components/clients/TierBadge';
import useClients from '../../hooks/useClients';
import type { Client } from '../../api/clientService';
import { formatDistanceToNow } from 'date-fns';

const ClientList = () => {
  const navigate = useNavigate();
  const {
    clients,
    isLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    statusFilter,
    tierFilter,
    dateRangeFilter,
    handlePageChange,
    handleSearchChange,
    handleStatusFilterChange,
    handleTierFilterChange,
    handleDateRangeFilterChange,
    clearFilters,
    getAvailableStatuses,
    getAvailableTiers,
  } = useClients();

  const [showFilters, setShowFilters] = useState(false);

  const handleViewClient = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  const handleEditClient = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/clients/${client.id}/edit`);
  };

  // Define table columns
  const columns: Column<Client>[] = [
    {
      key: 'name',
      title: 'Application',
      sortable: true,
      filterable: true,
      render: (client) => (
        <div>
          <div className="font-medium text-gray-900">{client.name}</div>
          <div className="text-sm text-gray-500">{client.companyName}</div>
        </div>
      ),
    },
    {
      key: 'tier',
      title: 'Tier',
      sortable: true,
      filterable: true,
      render: (client) => <TierBadge tier={client.tier} />,
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (client) => <StatusBadge status={client.status} />,
    },
    {
      key: 'email',
      title: 'Contact',
      sortable: true,
      filterable: true,
      render: (client) => (
        <div>
          <div className="text-sm text-gray-900">{client.email}</div>
          {client.accountOwner && (
            <div className="text-xs text-gray-500">{client.accountOwner}</div>
          )}
        </div>
      ),
    },
    {
      key: 'lastActiveAt',
      title: 'Last Active',
      sortable: true,
      render: (client) => (
        <div className="text-sm text-gray-500">
          {client.lastActiveAt
            ? formatDistanceToNow(new Date(client.lastActiveAt), {
                addSuffix: true,
              })
            : 'Never'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (client) => (
        <div className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (client) => (
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleViewClient(client);
            }}
            className="text-gray-600 hover:text-gray-900"
            title="View Client"
          >
            <Eye size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => handleEditClient(client, e)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit Client"
          >
            <Edit size={18} />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // Add dropdown menu logic here
              }}
              className="text-gray-600 hover:text-gray-900"
              title="More options"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">API Clients</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => navigate('/clients/new')}
            className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus size={16} className="mr-1" />
            Add Client
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative sm:max-w-md flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => handleSearchChange('')}
              >
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm ${
                showFilters ||
                statusFilter ||
                tierFilter ||
                dateRangeFilter.startDate
                  ? 'bg-gray-100 border-gray-300 text-gray-700'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Filter size={16} className="mr-1" />
              Filters
              {(statusFilter || tierFilter || dateRangeFilter.startDate) && (
                <span className="ml-1 bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-xs">
                  {[
                    statusFilter ? 1 : 0,
                    tierFilter ? 1 : 0,
                    dateRangeFilter.startDate ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>

            {(statusFilter || tierFilter || dateRangeFilter.startDate) && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <X size={16} className="mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            {/* Status filter */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">All Statuses</option>
                {getAvailableStatuses().map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tier filter */}
            <div>
              <label
                htmlFor="tier"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tier
              </label>
              <select
                id="tier"
                value={tierFilter}
                onChange={(e) => handleTierFilterChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">All Tiers</option>
                {getAvailableTiers().map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range filter */}
            <div>
              <label
                htmlFor="dateRange"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Created Date
              </label>
              <div className="flex space-x-2">
                <input
                  id="startDate"
                  type="date"
                  value={dateRangeFilter.startDate || ''}
                  onChange={(e) =>
                    handleDateRangeFilterChange(
                      e.target.value,
                      dateRangeFilter.endDate
                    )
                  }
                  className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  placeholder="Start date"
                />
                <input
                  id="endDate"
                  type="date"
                  value={dateRangeFilter.endDate || ''}
                  onChange={(e) =>
                    handleDateRangeFilterChange(
                      dateRangeFilter.startDate,
                      e.target.value
                    )
                  }
                  className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={clients}
        keyExtractor={(item) => item.id}
        onRowClick={handleViewClient}
        isLoading={isLoading}
        isSelectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyState={
          <EmptyState
            icon={<Database size={36} className="text-gray-400" />}
            title="No clients found"
            description="Try adjusting your search or filters, or create a new API client."
            action={
              <button
                type="button"
                onClick={() => navigate('/clients/new')}
                className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <Plus size={16} className="mr-1" />
                Add Client
              </button>
            }
          />
        }
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {clients.length} of {totalItems} clients
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ClientList;
