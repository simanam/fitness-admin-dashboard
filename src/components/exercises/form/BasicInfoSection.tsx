// src/components/exercises/form/BasicInfoSection.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import FormField from './FormField';
import { FORM_SECTIONS } from '../../../types/exerciseFormTypes';
import { AlertCircle } from 'lucide-react';

const BasicInfoSection: React.FC = () => {
  const { register } = useFormContext();

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
          label="Exercise Name"
          required
          helperText="Enter a clear, descriptive name for the exercise"
        >
          <Input
            {...register('name')}
            placeholder="e.g., Barbell Back Squat"
            className="mt-1"
          />
        </FormField>

        <FormField
          name="description"
          label="Description"
          required
          helperText="Provide a brief overview of the exercise"
        >
          <Textarea
            {...register('description')}
            placeholder="Describe the exercise and its primary benefits..."
            rows={4}
            className="mt-1"
          />
        </FormField>

        <FormField
          name="difficulty"
          label="Difficulty Level"
          required
          helperText="Select the appropriate difficulty level"
        >
          <Select {...register('difficulty')} className="mt-1">
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </Select>
        </FormField>

        <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Note
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Choose the difficulty level carefully as it affects how the
                  exercise appears in progression paths and recommendations.
                  Consider:
                </p>
                <ul className="list-disc list-inside mt-2">
                  <li>Technical complexity</li>
                  <li>Required strength/fitness level</li>
                  <li>Coordination demands</li>
                  <li>Risk level with improper form</li>
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
