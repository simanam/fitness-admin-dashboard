// src/components/common/DataTable.tsx
import { type FC, type ReactNode, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: keyof T;
  title: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  initialSortKey?: keyof T;
  initialSortDirection?: 'asc' | 'desc';
  isLoading?: boolean;
  emptyState?: ReactNode;
  isSelectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  initialSortKey,
  initialSortDirection = 'asc',
  isLoading = false,
  emptyState,
  isSelectable = false,
  selectedIds = [],
  onSelectionChange,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | undefined>(initialSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    initialSortDirection
  );
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filterOpen, setFilterOpen] = useState<Record<string, boolean>>({});
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedIds);

  // Apply sorting and filtering when data changes
  useEffect(() => {
    let result = [...data];

    // Apply search if any
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter((item) => {
        return Object.values(item).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply filters if any
    for (const [key, value] of Object.entries(filters)) {
      if (value.trim()) {
        const valueLower = value.toLowerCase();
        result = result.filter((item) => {
          const itemValue = item[key];
          if (itemValue === null || itemValue === undefined) return false;
          return String(itemValue).toLowerCase().includes(valueLower);
        });
      }
    }

    // Apply sorting if a sort key is specified
    if (sortKey) {
      result.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (aValue === bValue) return 0;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredData(result);
  }, [data, filters, sortKey, sortDirection, search]);

  // Update selection when selectedIds prop changes
  useEffect(() => {
    setSelected(selectedIds);
  }, [selectedIds]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilter = (key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    setFilterOpen((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  const toggleFilter = (key: string) => {
    setFilterOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = filteredData.map((item) => String(keyExtractor(item)));
      setSelected(allIds);
      onSelectionChange?.(allIds);
    } else {
      setSelected([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string, isChecked: boolean) => {
    const newSelected = isChecked
      ? [...selected, id]
      : selected.filter((selectedId) => selectedId !== id);

    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  // Create skeleton loading state
  const renderSkeletonRow = (index: number) => (
    <tr key={`skeleton-row-${index}`}>
      {isSelectable && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      )}
      {columns.map((column) => (
        <td
          key={`skeleton-${column.key}-${index}`}
          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
        >
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );

  return (
    <div className={cn('overflow-x-auto', className)}>
      {/* Search and filter bar */}
      {columns.some((col) => col.filterable) && (
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            {search && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearch('')}
              >
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {Object.entries(filters).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full"
              >
                <span className="text-xs font-medium text-gray-700">
                  {key}:
                </span>
                <span className="text-xs text-gray-600">{value}</span>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => clearFilter(key)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="shadow border-b border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {isSelectable && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                    checked={
                      selected.length === filteredData.length &&
                      filteredData.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.width ? column.width : '',
                    column.sortable || column.filterable
                      ? 'cursor-pointer hover:bg-gray-100'
                      : ''
                  )}
                >
                  <div className="flex items-center space-x-1">
                    <button
                      className="flex-1 flex items-center"
                      onClick={() => column.sortable && handleSort(column.key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && column.sortable) {
                          handleSort(column.key);
                        }
                      }}
                      type="button"
                      disabled={!column.sortable}
                    >
                      <span>{column.title}</span>
                      {column.sortable && sortKey === column.key && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? (
                            <ChevronUp size={16} className="text-gray-500" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-500" />
                          )}
                        </span>
                      )}
                    </button>

                    {column.filterable && (
                      <div className="relative">
                        <button
                          type="button"
                          className={cn(
                            'p-1 rounded hover:bg-gray-200',
                            filterOpen[String(column.key)] ? 'bg-gray-200' : ''
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFilter(String(column.key));
                          }}
                        >
                          <Filter size={14} className="text-gray-500" />
                        </button>

                        {filterOpen[String(column.key)] && (
                          <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <div className="p-2">
                              <input
                                type="text"
                                placeholder={`Filter by ${column.title}`}
                                value={filters[String(column.key)] || ''}
                                onChange={(e) =>
                                  handleFilterChange(
                                    String(column.key),
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              // Render skeleton loading rows
              Array.from({ length: 5 }).map((_, index) =>
                renderSkeletonRow(index)
              )
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => {
                const id = String(keyExtractor(item));
                return (
                  <tr
                    key={id}
                    className={cn(
                      'hover:bg-gray-50',
                      onRowClick ? 'cursor-pointer' : ''
                    )}
                    onClick={() => onRowClick?.(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && onRowClick) {
                        onRowClick(item);
                      }
                    }}
                    role={onRowClick ? 'button' : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                  >
                    {isSelectable && (
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                          checked={selected.includes(id)}
                          onChange={(e) =>
                            handleSelectRow(id, e.target.checked)
                          }
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {column.render
                          ? column.render(item)
                          : String(item[column.key])}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (isSelectable ? 1 : 0)}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center">
                      <p className="mb-2 text-gray-500">No data found</p>
                      {Object.keys(filters).length > 0 && (
                        <button
                          type="button"
                          className="text-sm text-gray-600 underline hover:text-gray-900"
                          onClick={() => setFilters({})}
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
