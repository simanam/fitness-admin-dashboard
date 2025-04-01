// src/components/exercises/form/InstructionsSection.tsx
import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Info } from 'lucide-react';
import { Textarea } from '../../ui/textarea';
import { ExerciseFormData } from '../../../types/exerciseFormTypes';
import {
  parseInstructions,
  formatInstructions,
} from '../../../utils/instructionsParser';

const InstructionsSection: React.FC = () => {
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<ExerciseFormData>();

  // Watch the instructions field to update form_points when it changes
  const instructions = useWatch({ name: 'instructions' });

  // Keep form_points in sync with instructions text
  useEffect(() => {
    if (instructions) {
      const parsedFormPoints = parseInstructions(instructions);
      // Set the form_points object based on parsed instructions
      setValue('form_points', parsedFormPoints, { shouldDirty: true });
    }
  }, [instructions, setValue]);

  // Initialize instructions from form_points if coming from existing exercise
  useEffect(() => {
    const currentInstructions = getValues('instructions');
    const formPoints = getValues('form_points');

    // If we have form_points but no instructions text, format the instructions
    if (
      !currentInstructions &&
      formPoints &&
      (formPoints.setup?.length > 0 ||
        formPoints.execution?.length > 0 ||
        formPoints.breathing?.length > 0 ||
        formPoints.alignment?.length > 0)
    ) {
      const formattedInstructions = formatInstructions(formPoints);
      setValue('instructions', formattedInstructions, { shouldDirty: false });
    }
  }, [getValues, setValue]);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Exercise Instructions
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Provide clear, step-by-step instructions on how to perform the
          exercise.
        </p>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
          <div className="flex">
            <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">
                Formatting Tips
              </h4>
              <ul className="mt-1 text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>
                  Start with section headers like "Setup:", "Execution:", etc.
                </li>
                <li>Put each instruction point on a new line</li>
                <li>Add a blank line between different sections</li>
                <li>
                  Numbered steps will be preserved for setup and execution
                </li>
                <li>
                  Bullet points will be preserved for breathing and alignment
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions
          </label>
          <Textarea
            {...register('instructions')}
            rows={15}
            placeholder={`Setup:
1. Position your feet shoulder-width apart
2. Grip the bar at shoulder width

Execution:
1. Lower your body by bending your knees and hips
2. Keep your back straight and chest up
3. Lower until thighs are parallel to ground
4. Push through your heels to return to starting position

Breathing:
- Inhale as you lower
- Exhale as you push up

Alignment:
- Keep knees in line with toes
- Maintain neutral spine throughout`}
            className="w-full"
          />
          {errors.instructions && (
            <p className="mt-1 text-sm text-red-600">
              {errors.instructions.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <h4 className="text-sm font-medium text-yellow-800">Note</h4>
        <p className="mt-1 text-sm text-yellow-700">
          Instructions will be automatically parsed into separate sections for
          setup, execution, breathing, and alignment guidance. The system
          recognizes section headers like "Setup:", "Execution:", "Breathing:",
          and "Alignment:".
        </p>
      </div>
    </div>
  );
};

export default InstructionsSection;
