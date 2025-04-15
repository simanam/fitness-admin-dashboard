// src/pages/muscles/components/MuscleExercisesTable.tsx
import { useState, useEffect, memo } from 'react';
import type { FC, ReactNode } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  X,
  Eye,
  Dumbbell,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { ExerciseWithMuscleDetails } from '../../../api/muscleExerciseService';
import EmptyState from '../../../components/ui/empty-state';

interface Column {
  key: string;
  title: string;
  render?: (item: ExerciseWithMuscleDetails) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

interface MuscleExercisesTableProps {
  data: ExerciseWithMuscleDetails[];
  isLoading: boolean;
  onRowClick?: (exercise: ExerciseWithMuscleDetails) => void;
  emptyState?: ReactNode;
  keyExtractor?: (item: ExerciseWithMuscleDetails) => string | number;
}

// Create a specialized table component just for muscle exercises
const MuscleExercisesTable: FC<MuscleExercisesTableProps> = ({
  data,
  isLoading,
  onRowClick,
  emptyState,
  keyExtractor = (item: ExerciseWithMuscleDetails) => item.id,
}) => {
  const [sortKey, setSortKey] = useState<string | undefined>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filterOpen, setFilterOpen] = useState<Record<string, boolean>>({});
  const [filteredData, setFilteredData] = useState<ExerciseWithMuscleDetails[]>(
    []
  );
  const [search, setSearch] = useState('');

  // Helper function for role color
  const getRoleColor = (role: string | undefined) => {
    const roleUpperCase = (role || '').toUpperCase();
    switch (roleUpperCase) {
      case 'PRIMARY':
        return 'bg-blue-100 text-blue-800';
      case 'SECONDARY':
        return 'bg-purple-100 text-purple-800';
      case 'TERTIARY':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Define columns specific to muscle exercises
  const columns: Column[] = [
    {
      key: 'name',
      title: 'Exercise Name',
      sortable: true,
      render: (exercise: ExerciseWithMuscleDetails) => exercise.name,
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      render: (exercise) => {
        const role = exercise.role;
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${getRoleColor(role)}`}
          >
            {role.toLowerCase()}
          </span>
        );
      },
    },
    {
      key: 'activationPercentage',
      title: 'Activation',
      sortable: true,
      render: (exercise) => {
        const activationPercentage = exercise.activationPercentage || 0;
        return (
          <div className="flex items-center">
            <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[100px] mr-2">
              <div
                className="h-2 bg-blue-500 rounded-full"
                style={{ width: `${activationPercentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {activationPercentage}%
            </span>
          </div>
        );
      },
    },
    {
      key: 'difficulty',
      title: 'Difficulty',
      sortable: true,
      render: (exercise) => {
        const difficultyValue = exercise.difficulty.toUpperCase();

        const colors = {
          BEGINNER: 'bg-green-100 text-green-800',
          INTERMEDIATE: 'bg-blue-100 text-blue-800',
          ADVANCED: 'bg-red-100 text-red-800',
        };

        const colorClass =
          colors[difficultyValue as keyof typeof colors] || colors.BEGINNER;

        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
            {difficultyValue.toLowerCase()}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (exercise) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRowClick?.(exercise);
          }}
          className="text-gray-600 hover:text-gray-900"
          title="View Exercise"
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

  // Apply sorting and filtering when data changes
  useEffect(() => {
    let result = [...data];

    // Apply search if any
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter((item) => {
        // Search in exercise name
        if (item.name.toLowerCase().includes(searchLower)) return true;

        // Search in role
        if (item.role.toLowerCase().includes(searchLower)) return true;

        // Search in activation percentage
        if (String(item.activationPercentage || 0).includes(searchLower))
          return true;

        // Search in difficulty
        if (item.difficulty.toLowerCase().includes(searchLower)) return true;

        return false;
      });
    }

    // Apply filters if any
    for (const [key, value] of Object.entries(filters)) {
      if (value.trim()) {
        const valueLower = value.toLowerCase();
        result = result.filter((item) => {
          if (key === 'name') {
            return item.name.toLowerCase().includes(valueLower);
          }
          if (key === 'role') {
            return item.role.toLowerCase().includes(valueLower);
          }
          if (key === 'activationPercentage') {
            return String(item.activationPercentage || 0).includes(valueLower);
          }
          if (key === 'difficulty') {
            return item.difficulty.toLowerCase().includes(valueLower);
          }
          return true;
        });
      }
    }

    // Apply sorting if a sort key is specified
    if (sortKey) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortKey === 'name') {
          aValue = a.name;
          bValue = b.name;
        } else if (sortKey === 'role') {
          aValue = a.role;
          bValue = b.role;
        } else if (sortKey === 'activationPercentage') {
          aValue = a.activationPercentage || 0;
          bValue = b.activationPercentage || 0;
        } else if (sortKey === 'difficulty') {
          aValue = a.difficulty;
          bValue = b.difficulty;
        } else {
          // Default values
          aValue = '';
          bValue = '';
        }

        if (aValue === bValue) return 0;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredData(result);
  }, [data, filters, sortKey, sortDirection, search]);

  const handleSort = (key: string) => {
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

  // Create skeleton loading state
  const renderSkeletonRow = (index: number) => (
    <tr key={`skeleton-row-${index}`}>
      {columns.map((column) => (
        <td
          key={`skeleton-col-${column.key}-${index}`}
          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
        >
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="overflow-x-auto">
      {/* Search and filter bar */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search exercises..."
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
        <div className="flex items-center space-x-2 flex-wrap">
          {Object.entries(filters).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full mb-1"
            >
              <span className="text-xs font-medium text-gray-700">{key}:</span>
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

      <div className="shadow border-b border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.width ? column.width : '',
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  )}
                >
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      className="flex-1 flex items-center"
                      onClick={() => {
                        if (column.sortable) handleSort(column.key);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (column.sortable) handleSort(column.key);
                        }
                      }}
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
                            filterOpen[column.key] ? 'bg-gray-200' : ''
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFilter(column.key);
                          }}
                        >
                          <Filter size={14} className="text-gray-500" />
                        </button>

                        {filterOpen[column.key] && (
                          <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <div className="p-2">
                              <input
                                type="text"
                                placeholder={`Filter by ${column.title}`}
                                value={filters[column.key] || ''}
                                onChange={(e) =>
                                  handleFilterChange(column.key, e.target.value)
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
                const id = keyExtractor(item);
                return (
                  <tr
                    key={id}
                    className={cn(
                      'hover:bg-gray-50',
                      onRowClick ? 'cursor-pointer' : ''
                    )}
                    onClick={() => onRowClick?.(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick?.(item);
                      }
                    }}
                    tabIndex={onRowClick ? 0 : -1}
                    aria-selected={false}
                  >
                    {columns.map((column) => (
                      <td
                        key={`${id}-${column.key}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        onClick={
                          column.key === 'actions'
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                        onKeyDown={
                          column.key === 'actions'
                            ? (e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }
                              }
                            : undefined
                        }
                      >
                        {column.render
                          ? column.render(item)
                          : (item[
                              column.key as keyof ExerciseWithMuscleDetails
                            ] as string)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  {emptyState || (
                    <EmptyState
                      icon={<Dumbbell size={36} className="text-gray-400" />}
                      title="No related exercises"
                      description="This muscle is not targeted by any exercises yet."
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(MuscleExercisesTable);
