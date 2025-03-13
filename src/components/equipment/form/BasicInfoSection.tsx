// src/components/equipment/form/BasicInfoSection.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import FormField from '../../exercises/form/FormField';
import {
  FORM_SECTIONS,
  CATEGORY_OPTIONS,
} from '../../../types/equipmentFormTypes';
import { Box } from 'lucide-react';

const BasicInfoSection: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

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
          label="Equipment Name"
          required
          helperText="Enter a clear, descriptive name for the equipment"
        >
          <Input
            {...register('name', {
              required: 'Equipment name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
            placeholder="e.g., Olympic Barbell"
            className="mt-1"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            name="category"
            label="Category"
            required
            helperText="Select the equipment category"
          >
            <Select
              {...register('category', { required: 'Category is required' })}
              className="mt-1"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="flex items-end">
            <Checkbox
              id="isCommon"
              {...register('isCommon')}
              label="Common Equipment"
              helperText="Check if this is commonly available equipment"
            />
          </div>
        </div>

        <FormField
          name="description"
          label="Description"
          helperText="Provide details about the equipment"
        >
          <Textarea
            {...register('description')}
            placeholder="Describe the equipment, its specifications, and how it's typically used..."
            rows={4}
            className="mt-1"
          />
        </FormField>

        <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
          <div className="flex">
            <Box className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Equipment Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Be specific when naming equipment to avoid confusion</li>
                  <li>
                    Mark as "Common Equipment" if it's typically available in
                    most gyms
                  </li>
                  <li>
                    Include dimensions and specifications in the description
                    when relevant
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
