// src/components/exercises/form/TechnicalDetailsSection.tsx
// Update to include equipment selection

import React, { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Select } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import FormField from './FormField';
import { FORM_SECTIONS } from '../../../types/exerciseFormTypes';
import equipmentService from '../../../api/equipmentService';

const TechnicalDetailsSection: React.FC = () => {
  const { register, watch, control } = useFormContext();
  const equipmentRequired = watch('equipment_required');
  const [equipment, setEquipment] = useState<{ id: string; name: string }[]>(
    []
  );
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);

  // Load equipment options when equipment_required is checked
  useEffect(() => {
    if (equipmentRequired) {
      const fetchEquipment = async () => {
        setIsLoadingEquipment(true);
        try {
          const data = await equipmentService.getAllEquipment();
          setEquipment(data.map((item) => ({ id: item.id, name: item.name })));
        } catch (error) {
          console.error('Error fetching equipment:', error);
        } finally {
          setIsLoadingEquipment(false);
        }
      };

      fetchEquipment();
    }
  }, [equipmentRequired]);

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
        {/* Original technical details fields... */}
        <FormField
          name="movement_pattern"
          label="Movement Pattern"
          required
          helperText="The primary movement pattern of the exercise"
        >
          <Select {...register('movement_pattern')} className="mt-1">
            <option value="squat">Squat</option>
            <option value="hinge">Hinge</option>
            <option value="push">Push</option>
            <option value="pull">Pull</option>
            <option value="carry">Carry</option>
            <option value="rotation">Rotation</option>
            <option value="lunge">Lunge</option>
            <option value="core">Core</option>
          </Select>
        </FormField>

        <FormField
          name="mechanics"
          label="Exercise Mechanics"
          required
          helperText="Type of mechanical movement"
        >
          <Select {...register('mechanics')} className="mt-1">
            <option value="compound">Compound</option>
            <option value="isolation">Isolation</option>
          </Select>
        </FormField>

        <FormField
          name="force"
          label="Force Type"
          required
          helperText="Primary force application"
        >
          <Select {...register('force')} className="mt-1">
            <option value="push">Push</option>
            <option value="pull">Pull</option>
          </Select>
        </FormField>

        <FormField
          name="plane_of_motion"
          label="Plane of Motion"
          required
          helperText="Primary plane of movement"
        >
          <Select {...register('plane_of_motion')} className="mt-1">
            <option value="sagittal">Sagittal</option>
            <option value="frontal">Frontal</option>
            <option value="transverse">Transverse</option>
            <option value="multi-planar">Multi-Planar</option>
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

          {/* Show equipment selection when equipment_required is checked */}
          {equipmentRequired && (
            <div className="mt-4">
              <FormField
                name="primary_equipment"
                label="Select Primary Equipment"
                helperText="Choose the main equipment needed for this exercise"
              >
                <Controller
                  name="primary_equipment"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      className="mt-1"
                      disabled={isLoadingEquipment}
                    >
                      <option value="">Select equipment...</option>
                      {equipment.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
                {isLoadingEquipment && (
                  <div className="mt-2 text-sm text-gray-500">
                    Loading equipment options...
                  </div>
                )}
              </FormField>
            </div>
          )}

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
