// src/components/muscles/form/BasicInfoSection.tsx
import React from 'react';
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

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ muscleId }) => {
  const { register } = useFormContext();
  const { muscleGroups, isLoading } = useMuscleGroups();

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
        >
          <Input
            {...register('name')}
            placeholder="e.g., Rectus Femoris"
            className="mt-1"
          />
        </FormField>

        <FormField
          name="commonName"
          label="Common Name"
          helperText="Enter a commonly used name for this muscle (optional)"
        >
          <Input
            {...register('commonName')}
            placeholder="e.g., Quad"
            className="mt-1"
          />
        </FormField>

        <FormField
          name="description"
          label="Description"
          helperText="Provide a brief description of the muscle"
        >
          <Textarea
            {...register('description')}
            placeholder="Describe the muscle's location, function, and other relevant details..."
            rows={4}
            className="mt-1"
          />
        </FormField>

        <FormField
          name="muscleGroupId"
          label="Muscle Group"
          required
          helperText="Select the group this muscle belongs to"
        >
          <Select
            {...register('muscleGroupId')}
            className="mt-1"
            disabled={isLoading}
          >
            <option value="">Select a muscle group</option>
            {/* Group options by category */}
            {Object.entries(
              muscleGroups.reduce(
                (acc, group) => {
                  const category = group.category;
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(group);
                  return acc;
                },
                {} as Record<string, typeof muscleGroups>
              )
            ).map(([category, groups]) => (
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

        {/* New SVG Upload Field */}
        <SvgUploadField muscleId={muscleId} />

        <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
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
