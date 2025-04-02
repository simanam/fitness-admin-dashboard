// src/pages/equipment/components/EquipmentExercisesTable.tsx
import React, { useState, useEffect, memo } from 'react';
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
import EmptyState from '../../../components/ui/empty-state';
import { ExerciseWithEquipmentDetails } from '../../../api/equipmentExerciseService';

interface Column {
  key: string;
  title: string;
  render?: (item: ExerciseWithEquipmentDetails) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

interface EquipmentExercisesTableProps {
  data: ExerciseWithEquipmentDetails[];
  isLoading: boolean;
  onViewExercise: (exercise: ExerciseWithEquipmentDetails) => void;
}

// Create a specialized table component just for equipment exercises
const EquipmentExercisesTable: React.FC<EquipmentExercisesTableProps> = ({
  data,
  isLoading,
  onViewExercise,
}) => {
  const [sortKey, setSortKey] = useState<string | undefined>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filterOpen, setFilterOpen] = useState<Record<string, boolean>>({});
  const [filteredData, setFilteredData] = useState<
    ExerciseWithEquipmentDetails[]
  >([]);
  const [search, setSearch] = useState('');

  // Define columns specific to equipment exercises
  const columns: Column[] = [
    {
      key: 'name',
      title: 'Exercise Name',
      sortable: true,
      render: (exercise) =>
        exercise.exercise?.name || exercise.name || 'Unnamed Exercise',
    },
    {
      key: 'isRequired',
      title: 'Requirement',
      sortable: true,
      render: (exercise) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            exercise.isRequired
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {exercise.isRequired ? 'Required' : 'Optional'}
        </span>
      ),
    },
    {
      key: 'setupNotes',
      title: 'Setup Notes',
      render: (exercise) => (
        <div className="max-w-md truncate">
          {exercise.setupNotes || 'No setup notes available'}
        </div>
      ),
    },
    {
      key: 'difficulty',
      title: 'Difficulty',
      sortable: true,
      render: (exercise) => {
        // Safely access the difficulty property
        const difficultyValue = (
          exercise.exercise?.difficulty ||
          exercise.difficulty ||
          'BEGINNER'
        ).toUpperCase();

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
          onClick={() => onViewExercise(exercise)}
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
        const exerciseName = item.exercise?.name || item.name || '';
        if (exerciseName.toLowerCase().includes(searchLower)) return true;

        // Search in setup notes
        const setupNotes = item.setupNotes || '';
        if (setupNotes.toLowerCase().includes(searchLower)) return true;

        // Search in difficulty
        const difficulty = item.exercise?.difficulty || item.difficulty || '';
        if (difficulty.toLowerCase().includes(searchLower)) return true;

        return false;
      });
    }

    // Apply filters if any
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) {
        const valueLower = value.toLowerCase();
        result = result.filter((item) => {
          if (key === 'name') {
            const name = item.exercise?.name || item.name || '';
            return name.toLowerCase().includes(valueLower);
          }
          if (key === 'isRequired') {
            const isRequired = item.isRequired ? 'required' : 'optional';
            return isRequired.includes(valueLower);
          }
          if (key === 'setupNotes') {
            const notes = item.setupNotes || '';
            return notes.toLowerCase().includes(valueLower);
          }
          if (key === 'difficulty') {
            const difficulty = (
              item.exercise?.difficulty ||
              item.difficulty ||
              ''
            ).toLowerCase();
            return difficulty.includes(valueLower);
          }
          return true;
        });
      }
    });

    // Apply sorting if a sort key is specified
    if (sortKey) {
      result.sort((a, b) => {
        let aValue, bValue;

        if (sortKey === 'name') {
          aValue = a.exercise?.name || a.name || '';
          bValue = b.exercise?.name || b.name || '';
        } else if (sortKey === 'isRequired') {
          aValue = a.isRequired ? 1 : 0;
          bValue = b.isRequired ? 1 : 0;
        } else if (sortKey === 'difficulty') {
          // Create a difficulty ranking
          const difficultyRank = {
            BEGINNER: 1,
            INTERMEDIATE: 2,
            ADVANCED: 3,
          };

          const aDiff = (
            a.exercise?.difficulty ||
            a.difficulty ||
            'BEGINNER'
          ).toUpperCase();
          const bDiff = (
            b.exercise?.difficulty ||
            b.difficulty ||
            'BEGINNER'
          ).toUpperCase();

          aValue = difficultyRank[aDiff as keyof typeof difficultyRank] || 1;
          bValue = difficultyRank[bDiff as keyof typeof difficultyRank] || 1;
        } else if (sortKey === 'setupNotes') {
          aValue = a.setupNotes || '';
          bValue = b.setupNotes || '';
        } else {
          // Default to comparing by name
          aValue = a.exercise?.name || a.name || '';
          bValue = b.exercise?.name || b.name || '';
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
      {columns.map((column, colIndex) => (
        <td
          key={`skeleton-col-${colIndex}`}
          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
        >
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
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
              <span className="text-xs font-medium text-gray-700">{key}:</span>
              <span className="text-xs text-gray-600">{value}</span>
              <button
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
                    column.sortable || column.filterable
                      ? 'cursor-pointer hover:bg-gray-100'
                      : ''
                  )}
                >
                  <div className="flex items-center space-x-1">
                    <div
                      className="flex-1 flex items-center"
                      onClick={() => column.sortable && handleSort(column.key)}
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
                    </div>

                    {column.filterable && (
                      <div className="relative">
                        <button
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
                const id = item.id || `${item.exerciseId}-${item.equipmentId}`;
                return (
                  <tr
                    key={id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onViewExercise(item)}
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
                      >
                        {column.render
                          ? column.render(item)
                          : (item as any)[column.key]}
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
                  <EmptyState
                    icon={<Dumbbell size={36} className="text-gray-400" />}
                    title="No related exercises"
                    description="This equipment is not used by any exercises yet."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(EquipmentExercisesTable);
