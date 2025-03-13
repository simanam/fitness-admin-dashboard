// src/components/exercises/BulkMuscleTargetForm.tsx
import { useState, useEffect } from 'react';
import { Muscle, MuscleGroup } from '../../api/muscleService';
import { CreateMuscleTargetPayload } from '../../api/exerciseMuscleService';
import { CheckCircle } from 'lucide-react';
import { Label } from '../ui/label';

interface MuscleSelection {
  muscle: Muscle;
  selected: boolean;
  role: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  activationPercentage: number;
}

interface BulkMuscleTargetFormProps {
  muscles: Muscle[];
  muscleGroups?: MuscleGroup[];
  onSubmit: (
    targets: Omit<CreateMuscleTargetPayload, 'exerciseId'>[]
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const BulkMuscleTargetForm = ({
  muscles,
  muscleGroups = [],
  onSubmit,
  onCancel,
  isSubmitting,
}: BulkMuscleTargetFormProps) => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [muscleSelections, setMuscleSelections] = useState<MuscleSelection[]>(
    []
  );
  const [filteredSelections, setFilteredSelections] = useState<
    MuscleSelection[]
  >([]);
  const [search, setSearch] = useState('');

  // Initialize muscle selections
  useEffect(() => {
    const initialSelections = muscles.map((muscle) => ({
      muscle,
      selected: false,
      role: 'SECONDARY' as const,
      activationPercentage: 30,
    }));

    setMuscleSelections(initialSelections);
  }, [muscles]);

  // Filter selections based on tab and search
  useEffect(() => {
    let filtered = [...muscleSelections];

    // Filter by group if not "all"
    if (selectedTab !== 'all') {
      filtered = filtered.filter(
        (item) => item.muscle.muscleGroupId === selectedTab
      );
    }

    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.muscle.name.toLowerCase().includes(searchLower) ||
          (item.muscle.commonName &&
            item.muscle.commonName.toLowerCase().includes(searchLower))
      );
    }

    setFilteredSelections(filtered);
  }, [muscleSelections, selectedTab, search]);

  // Toggle selection for a muscle
  const toggleMuscleSelection = (muscleId: string) => {
    setMuscleSelections((prev) =>
      prev.map((item) =>
        item.muscle.id === muscleId
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  // Update role for a muscle
  const updateMuscleRole = (
    muscleId: string,
    role: 'PRIMARY' | 'SECONDARY' | 'TERTIARY'
  ) => {
    setMuscleSelections((prev) =>
      prev.map((item) =>
        item.muscle.id === muscleId ? { ...item, role } : item
      )
    );
  };

  // Update activation percentage for a muscle
  const updateActivationPercentage = (muscleId: string, percentage: number) => {
    setMuscleSelections((prev) =>
      prev.map((item) =>
        item.muscle.id === muscleId
          ? { ...item, activationPercentage: percentage }
          : item
      )
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    const selectedMuscles = muscleSelections.filter((item) => item.selected);

    if (selectedMuscles.length === 0) {
      // Show validation error or toast
      return;
    }

    const targets = selectedMuscles.map((item) => ({
      muscleId: item.muscle.id,
      role: item.role,
      activationPercentage: item.activationPercentage,
    }));

    await onSubmit(targets);
  };

  // Calculate selected count
  const selectedCount = muscleSelections.filter((item) => item.selected).length;

  // Define common activation percentages for quick selection
  const commonPercentages = [10, 30, 50, 70, 90];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium text-gray-900">
          Add Multiple Muscle Targets
        </h3>
        <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
          {selectedCount} selected
        </div>
      </div>

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search muscles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
        />
      </div>

      {/* Group tabs */}
      <div className="flex overflow-x-auto pb-2 space-x-2">
        <button
          onClick={() => setSelectedTab('all')}
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
            selectedTab === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Muscles
        </button>

        {muscleGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelectedTab(group.id)}
            className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
              selectedTab === group.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {group.name}
          </button>
        ))}
      </div>

      {/* Muscle selection list */}
      <div className="border border-gray-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
        {filteredSelections.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredSelections.map(
              ({ muscle, selected, role, activationPercentage }) => (
                <div
                  key={muscle.id}
                  className={`p-3 ${selected ? 'bg-gray-50' : ''} hover:bg-gray-50`}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5 mt-1">
                      <input
                        id={`muscle-${muscle.id}`}
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleMuscleSelection(muscle.id)}
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <label
                        htmlFor={`muscle-${muscle.id}`}
                        className="font-medium text-gray-900 flex items-center cursor-pointer"
                      >
                        {muscle.name}
                        {muscle.commonName && (
                          <span className="ml-1 text-sm text-gray-500">
                            ({muscle.commonName})
                          </span>
                        )}
                        {selected && (
                          <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                        )}
                      </label>

                      {selected && (
                        <div className="mt-2 space-y-3">
                          {/* Role selection */}
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500">
                              Muscle Role
                            </Label>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateMuscleRole(muscle.id, 'PRIMARY')
                                }
                                className={`px-2 py-1 text-xs rounded ${
                                  role === 'PRIMARY'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                              >
                                Primary
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateMuscleRole(muscle.id, 'SECONDARY')
                                }
                                className={`px-2 py-1 text-xs rounded ${
                                  role === 'SECONDARY'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                              >
                                Secondary
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateMuscleRole(muscle.id, 'TERTIARY')
                                }
                                className={`px-2 py-1 text-xs rounded ${
                                  role === 'TERTIARY'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                              >
                                Tertiary
                              </button>
                            </div>
                          </div>

                          {/* Activation percentage selection */}
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <Label className="text-xs text-gray-500">
                                Activation: {activationPercentage}%
                              </Label>
                            </div>

                            <div className="flex space-x-1">
                              {commonPercentages.map((percent) => (
                                <button
                                  key={percent}
                                  type="button"
                                  onClick={() =>
                                    updateActivationPercentage(
                                      muscle.id,
                                      percent
                                    )
                                  }
                                  className={`px-2 py-1 text-xs rounded ${
                                    activationPercentage === percent
                                      ? 'bg-gray-900 text-white'
                                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  }`}
                                >
                                  {percent}%
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            No muscles found matching your search.
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          disabled={isSubmitting || selectedCount === 0}
        >
          {isSubmitting ? 'Adding...' : `Add ${selectedCount} Muscles`}
        </button>
      </div>
    </div>
  );
};

export default BulkMuscleTargetForm;
