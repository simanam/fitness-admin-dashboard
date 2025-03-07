// src/components/exercises/form/InstructionsSection.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Textarea } from '../../../components/ui/textarea';
import FormField from './FormField';
import { FORM_SECTIONS } from '../../../types/exerciseFormTypes';
import { Info } from 'lucide-react';

const InstructionsSection: React.FC = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {FORM_SECTIONS.instructions.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {FORM_SECTIONS.instructions.description}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Writing Effective Instructions
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Consider including:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Starting position and setup</li>
                <li>Key movement steps in sequence</li>
                <li>Breathing pattern recommendations</li>
                <li>Important form cues and common mistakes</li>
                <li>Range of motion guidelines</li>
                <li>Safety considerations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <FormField
        name="instructions"
        label="Exercise Instructions"
        helperText="Provide clear, step-by-step instructions for performing the exercise"
      >
        <Textarea
          {...register('instructions')}
          placeholder="1. Start by...[setup]\n2. Next...[key movement steps]\n3. During the movement...[form cues]\n4. Return to...[finishing position]"
          rows={8}
          className="mt-1 font-mono"
        />
      </FormField>
    </div>
  );
};

export default InstructionsSection;
