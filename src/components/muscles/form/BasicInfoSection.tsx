// src/components/muscles/form/BasicInfoSection.tsx
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useMuscleGroups } from '../../../hooks/useMuscleGroups';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import FormField from '../../exercises/form/FormField';
import { FORM_SECTIONS } from '../../../types/muscleFormTypes';
import { AlertCircle } from 'lucide-react';
import SvgUploadField from './SvgUploadField';

interface BasicInfoSectionProps {
  muscleId?: string;
}

interface MuscleFormData {
  name: string;
  commonName?: string;
  description?: string;
  muscleGroupId: string;
}

interface MuscleGroup {
  id: string;
  name: string;
  category: string;
}

const BasicInfoSection: FC<BasicInfoSectionProps> = ({ muscleId }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<MuscleFormData>();
  const { muscleGroups, isLoading } = useMuscleGroups();

  const groupedMuscleGroups = muscleGroups.reduce<
    Record<string, MuscleGroup[]>
  >((acc, group) => {
    const category = group.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(group);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {FORM_SECTIONS.basic.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {FORM_SECTIONS.basic.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FormField
          name="name"
          label="Muscle Name"
          required
          helperText="Enter the anatomical name of the muscle"
          error={errors.name?.message}
        >
          <Input
            {...register('name', {
              required: 'Muscle name is required',
              maxLength: {
                value: 100,
                message: 'Name must be less than 100 characters',
              },
            })}
            placeholder="e.g., Rectus Femoris"
            className="mt-1"
            aria-describedby="name-description"
            maxLength={100}
          />
        </FormField>

        <FormField
          name="commonName"
          label="Common Name"
          helperText="Enter a commonly used name for this muscle (optional)"
          error={errors.commonName?.message}
        >
          <Input
            {...register('commonName', {
              maxLength: {
                value: 50,
                message: 'Common name must be less than 50 characters',
              },
            })}
            placeholder="e.g., Quad"
            className="mt-1"
            aria-describedby="commonName-description"
            maxLength={50}
          />
        </FormField>

        <FormField
          name="description"
          label="Description"
          helperText="Provide a brief description of the muscle"
          error={errors.description?.message}
        >
          <Textarea
            {...register('description', {
              maxLength: {
                value: 1000,
                message: 'Description must be less than 1000 characters',
              },
            })}
            placeholder="Describe the muscle's location, function, and other relevant details..."
            rows={4}
            className="mt-1"
            aria-describedby="description-description"
            maxLength={1000}
          />
        </FormField>

        <FormField
          name="muscleGroupId"
          label="Muscle Group"
          required
          helperText="Select the group this muscle belongs to"
          error={errors.muscleGroupId?.message}
        >
          <Select
            {...register('muscleGroupId', {
              required: 'Muscle group is required',
            })}
            className="mt-1"
            disabled={isLoading}
            aria-describedby="muscleGroupId-description"
          >
            <option value="">Select a muscle group</option>
            {Object.entries(groupedMuscleGroups).map(([category, groups]) => (
              <optgroup key={category} label={category.replace('_', ' ')}>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </FormField>

        {/* SVG Upload Field */}
        <SvgUploadField muscleId={muscleId} />

        <div
          className="bg-yellow-50 border border-yellow-100 rounded-md p-4"
          role="alert"
        >
          <div className="flex">
            <AlertCircle
              className="h-5 w-5 text-yellow-400 flex-shrink-0"
              aria-hidden="true"
            />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Note
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  When naming muscles, use standardized anatomical terminology
                  to ensure consistency. The common name field can be used for
                  more widely recognized terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
