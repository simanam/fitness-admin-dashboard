// src/components/exercises/form/BasicInfoSection.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';

const BasicInfoSection: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      {/* Exercise Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Exercise Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          {...register('name', {
            required: 'Exercise name is required',
            minLength: {
              value: 3,
              message: 'Name must be at least 3 characters',
            },
            maxLength: {
              value: 100,
              message: 'Name must be less than 100 characters',
            },
          })}
          placeholder="Enter exercise name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.name.message as string}
          </p>
        )}
      </div>

      {/* Exercise Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="description"
          {...register('description', {
            required: 'Description is required',
            minLength: {
              value: 10,
              message: 'Description must be at least 10 characters',
            },
          })}
          placeholder="Provide a detailed description of the exercise"
          rows={4}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message as string}
          </p>
        )}
      </div>

      {/* Difficulty */}
      <div>
        <label
          htmlFor="difficulty"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Difficulty Level <span className="text-red-500">*</span>
        </label>
        <Select
          id="difficulty"
          {...register('difficulty', {
            required: 'Difficulty level is required',
          })}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>
        {errors.difficulty && (
          <p className="mt-1 text-sm text-red-600">
            {errors.difficulty.message as string}
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status
        </label>
        <Select id="status" {...register('status')}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
        <p className="mt-1 text-xs text-gray-500">
          Draft exercises are only visible to administrators
        </p>
      </div>

      {/* Equipment Required */}
      <div>
        <Checkbox
          id="equipment_required"
          {...register('equipment_required')}
          label="Equipment Required"
          helperText="Check if this exercise requires equipment to perform"
        />
      </div>

      {/* Bilateral */}
      <div>
        <Checkbox
          id="bilateral"
          {...register('bilateral')}
          label="Bilateral Exercise"
          helperText="Check if this exercise works both sides of the body equally"
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;
