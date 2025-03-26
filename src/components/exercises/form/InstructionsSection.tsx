// src/components/exercises/form/InstructionsSection.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Info } from 'lucide-react';
import { Textarea } from '../../ui/textarea';
import { ExerciseFormData } from '../../../types/exerciseFormTypes';

const InstructionsSection: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ExerciseFormData>();

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
                <li>Start with setup instructions</li>
                <li>Include execution steps</li>
                <li>Add breathing cues if applicable</li>
                <li>Include form/alignment guidance</li>
                <li>Add a blank line between different sections</li>
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
              {errors.instructions.message}
            </p>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <h4 className="text-sm font-medium text-yellow-800">Note</h4>
        <p className="mt-1 text-sm text-yellow-700">
          Instructions will be automatically parsed into separate sections for
          setup, execution, breathing, and alignment guidance in the exercise
          database.
        </p>
      </div>
    </div>
  );
};

export default InstructionsSection;
