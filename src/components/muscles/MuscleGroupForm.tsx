// src/components/muscles/MuscleGroupForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { MuscleGroup } from '../../api/muscleService';

interface MuscleGroupFormData {
  name: string;
  category: 'upper_body' | 'lower_body' | 'core';
  description: string;
  parentGroupId: string | null;
}

interface MuscleGroupFormProps {
  initialData?: Partial<MuscleGroup>;
  groups?: MuscleGroup[];
  isLoading?: boolean;
  onSubmit: (data: MuscleGroupFormData) => Promise<void>;
  onCancel: () => void;
}

const MuscleGroupForm: React.FC<MuscleGroupFormProps> = ({
  initialData,
  groups = [],
  isLoading = false,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
  } = useForm<MuscleGroupFormData>({
    defaultValues: {
      name: initialData?.name || '',
      category: initialData?.category || 'upper_body',
      description: initialData?.description || '',
      parentGroupId: initialData?.parentGroupId || null,
    },
  });

  // Filter out the current group and its children from parent options
  const availableParentGroups = groups.filter(
    (group) => !initialData?.id || group.id !== initialData.id
  );

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        category: initialData.category || 'upper_body',
        description: initialData.description || '',
        parentGroupId: initialData.parentGroupId || null,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Group Name <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('name', {
              required: 'Group name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
            className="mt-1"
            placeholder="e.g., Arms, Chest, Legs"
            disabled={isSubmitting || isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <Select
            {...register('category', { required: 'Category is required' })}
            className="mt-1"
            disabled={isSubmitting || isLoading}
          >
            <option value="upper_body">Upper Body</option>
            <option value="lower_body">Lower Body</option>
            <option value="core">Core</option>
          </Select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Parent Group
          </label>
          <Select
            {...register('parentGroupId')}
            className="mt-1"
            disabled={isSubmitting || isLoading}
          >
            <option value="">None (Top Level Group)</option>
            {availableParentGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.category.replace('_', ' ')})
              </option>
            ))}
          </Select>
          <p className="mt-1 text-sm text-gray-500">
            Optional. Select a parent group to create a hierarchy.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Textarea
            {...register('description')}
            className="mt-1"
            rows={3}
            placeholder="Enter a brief description of this muscle group..."
            disabled={isSubmitting || isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 inline mr-1" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isDirty || !isValid}
          className="px-4 py-2 bg-black border border-transparent rounded-md text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 inline mr-1" />
          {isSubmitting
            ? 'Saving...'
            : initialData?.id
              ? 'Update Group'
              : 'Create Group'}
        </button>
      </div>
    </form>
  );
};

export default MuscleGroupForm;
