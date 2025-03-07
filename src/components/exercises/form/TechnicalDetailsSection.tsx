// src/components/exercises/form/TechnicalDetailsSection.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Select } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import FormField from './FormField';
import { FORM_SECTIONS } from '../../../types/exerciseFormTypes';

const TechnicalDetailsSection: React.FC = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {FORM_SECTIONS.technical.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {FORM_SECTIONS.technical.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          name="movement_pattern"
          label="Movement Pattern"
          required
          helperText="The primary movement pattern of the exercise"
        >
          <Select {...register('movement_pattern')} className="mt-1">
            <option value="SQUAT">Squat</option>
            <option value="HINGE">Hinge</option>
            <option value="PUSH">Push</option>
            <option value="PULL">Pull</option>
            <option value="CARRY">Carry</option>
            <option value="ROTATION">Rotation</option>
            <option value="LUNGE">Lunge</option>
            <option value="CORE">Core</option>
          </Select>
        </FormField>

        <FormField
          name="mechanics"
          label="Exercise Mechanics"
          required
          helperText="Type of mechanical movement"
        >
          <Select {...register('mechanics')} className="mt-1">
            <option value="COMPOUND">Compound</option>
            <option value="ISOLATION">Isolation</option>
          </Select>
        </FormField>

        <FormField
          name="force"
          label="Force Type"
          required
          helperText="Primary force application"
        >
          <Select {...register('force')} className="mt-1">
            <option value="PUSH">Push</option>
            <option value="PULL">Pull</option>
          </Select>
        </FormField>

        <FormField
          name="plane_of_motion"
          label="Plane of Motion"
          required
          helperText="Primary plane of movement"
        >
          <Select {...register('plane_of_motion')} className="mt-1">
            <option value="SAGITTAL">Sagittal</option>
            <option value="FRONTAL">Frontal</option>
            <option value="TRANSVERSE">Transverse</option>
          </Select>
        </FormField>

        <div className="md:col-span-2 space-y-4">
          <div>
            <Checkbox
              id="equipment_required"
              {...register('equipment_required')}
              label="Equipment Required"
              helperText="Check if this exercise requires equipment"
            />
          </div>

          <div>
            <Checkbox
              id="bilateral"
              {...register('bilateral')}
              label="Bilateral Movement"
              helperText="Check if the exercise works both sides simultaneously"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Movement Classifications Guide
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium mb-1">Movement Patterns:</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>Squat: Vertical displacement, knee/hip dominant</li>
              <li>Hinge: Hip dominant, forward torso lean</li>
              <li>Push: Moving resistance away from body</li>
              <li>Pull: Moving resistance toward body</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Mechanics:</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>Compound: Multiple joint movement</li>
              <li>Isolation: Single joint movement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDetailsSection;
